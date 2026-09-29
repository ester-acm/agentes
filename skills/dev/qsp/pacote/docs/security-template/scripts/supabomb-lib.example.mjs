/**
 * Biblioteca compartilhada — integração Supabomb (template).
 * Copiar para scripts/ no projeto e adaptar imports.
 */
import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const STATUSES = ['PASS', 'FAIL', 'INCOMPLETE', 'N/A', 'STALE'];

/** Estratégias de ambiente (PADRÃO CORPORATIVO). Produção nunca é fallback automático. */
export const ENVIRONMENT_STRATEGIES = [
  'EPHEMERAL_PREVIEW',
  'EXISTING_NON_PROD',
  'HUMAN_SETUP_REQUIRED',
];

export const MGMT_API_DEFAULT_BASE = 'https://api.supabase.com';

/**
 * Permissões mínimas recomendadas (OAuth / fine-grained) para Preview Branch.
 * PAT clássico é all-or-nothing — preferir fine-grained quando disponível.
 */
export const RECOMMENDED_FG_PERMISSIONS = [
  'branching_development_create',
  'branching_development_read',
  'branching_development_delete',
  'api_gateway_keys_read',
];

const SECRET_PATTERNS = [
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, // JWT-like
  /sb_secret_[A-Za-z0-9_-]+/g,
  /sb_publishable_[A-Za-z0-9_-]+/g,
  /service_role/gi,
  /SUPABOMB_ANON_KEY\s*[:=]\s*\S+/gi,
  /SUPABASE_ACCESS_TOKEN\s*[:=]\s*\S+/gi,
  /password["']?\s*[:=]\s*["'][^"']+["']/gi,
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
];

export function loadJson(filePath) {
  if (!existsSync(filePath)) {
    const err = new Error(`FILE_MISSING:${filePath}`);
    err.code = 'FILE_MISSING';
    throw err;
  }
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function detectSupabaseArchitecture(repoRoot) {
  const markers = [
    'supabase/config.toml',
    'supabase/migrations',
    'supabase/functions',
  ];
  const hits = [];
  for (const m of markers) {
    if (existsSync(path.join(repoRoot, m))) hits.push(m);
  }
  // package.json dependency hint
  const pkgPath = path.join(repoRoot, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['@supabase/supabase-js']) hits.push('package:@supabase/supabase-js');
    } catch {
      /* ignore */
    }
  }
  return {
    usesSupabase: hits.length > 0,
    evidence: hits,
  };
}

export function applicabilityFromDetection(detection, config) {
  if (config && config.applicable === false) {
    return {
      status: 'N/A',
      justification:
        config.applicabilityJustification ||
        'Supabomb não aplicável à arquitetura (config.applicable=false)',
    };
  }
  if (!detection.usesSupabase) {
    return {
      status: 'N/A',
      justification: 'Supabomb não aplicável à arquitetura (sem marcadores Supabase)',
    };
  }
  return {
    status: 'APPLICABLE',
    justification: `Supabase detectado: ${detection.evidence.join(', ')}`,
  };
}

export function countBySeverity(findings = []) {
  const out = { critical: 0, high: 0, medium: 0, low: 0, info: 0, other: 0 };
  for (const f of findings) {
    const s = String(f.severity || f.level || 'other').toLowerCase();
    if (out[s] != null) out[s] += 1;
    else out.other += 1;
  }
  return out;
}

export function extractFindings(report) {
  if (!report || typeof report !== 'object') return [];
  if (Array.isArray(report.findings)) return report.findings;
  if (Array.isArray(report.summary?.findings)) return report.summary.findings;
  if (report.report?.findings) return report.report.findings;
  return [];
}

/**
 * Avalia relatório Supabomb + política → PASS | FAIL | INCOMPLETE
 */
export function evaluateReport(report, policy = {}, meta = {}) {
  if (meta.scannerError) {
    return {
      status: 'INCOMPLETE',
      reason: `scanner_error:${meta.scannerError}`,
      counts: countBySeverity([]),
    };
  }
  if (meta.missingConfig) {
    return {
      status: 'INCOMPLETE',
      reason: `missing_config:${meta.missingConfig}`,
      counts: countBySeverity([]),
    };
  }
  if (!report) {
    return { status: 'INCOMPLETE', reason: 'report_absent', counts: countBySeverity([]) };
  }

  const findings = extractFindings(report);
  const counts = countBySeverity(findings);
  const p = {
    failOnCritical: true,
    failOnHigh: true,
    failOnMedium: false,
    failOnLow: false,
    failOnInfo: false,
    ...policy,
  };

  const blockers = [];
  if (p.failOnCritical && counts.critical > 0) blockers.push(`critical=${counts.critical}`);
  if (p.failOnHigh && counts.high > 0) blockers.push(`high=${counts.high}`);
  if (p.failOnMedium && counts.medium > 0) blockers.push(`medium=${counts.medium}`);
  if (p.failOnLow && counts.low > 0) blockers.push(`low=${counts.low}`);
  if (p.failOnInfo && counts.info > 0) blockers.push(`info=${counts.info}`);

  if (blockers.length) {
    return { status: 'FAIL', reason: `findings:${blockers.join(',')}`, counts, findings };
  }
  return { status: 'PASS', reason: 'no_blocking_findings', counts, findings };
}

function redactDeep(value, hits) {
  if (typeof value === 'string') {
    let s = value;
    for (const re of SECRET_PATTERNS) {
      const before = s;
      s = s.replace(re, '[REDACTED]');
      if (s !== before) hits.push('pattern_redacted');
    }
    if (/anon[_-]?key|service[_-]?role|jwt|password|secret/i.test(s) && s.length > 40) {
      // conservative: long secret-ish strings
      if (/^[A-Za-z0-9\-_.]+=*$/.test(s) && s.length > 80) {
        hits.push('long_token_redacted');
        return '[REDACTED]';
      }
    }
    return s;
  }
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, hits));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (/sample_data|password|token|anon_key|service_role|authorization|cookie|session/i.test(k)) {
        hits.push(`field_stripped:${k}`);
        out[k] = '[STRIPPED]';
      } else {
        out[k] = redactDeep(v, hits);
      }
    }
    return out;
  }
  return value;
}

/**
 * Sanitiza relatório antes de artifact. Nunca incluir .supabomb.json.
 */
export function sanitizeReport(report, opts = {}) {
  const hits = [];
  const clone = JSON.parse(JSON.stringify(report ?? {}));
  // strip credentials-ish top-level
  for (const k of ['anon_key', 'anonKey', 'service_role', 'credentials', 'cached']) {
    if (clone[k] != null) {
      hits.push(`top_stripped:${k}`);
      delete clone[k];
    }
  }
  const sanitized = redactDeep(clone, hits);
  if (opts.forbidPublishIfSecret && hits.some((h) => h.includes('pattern_redacted') || h.includes('long_token'))) {
    // still publish sanitized; caller may refuse if raw still contains secrets
  }
  return {
    sanitized: {
      generatedAt: new Date().toISOString(),
      tool: 'supabomb',
      sanitized: true,
      ...sanitized,
    },
    redactionHits: hits,
  };
}

export function containsLikelySecret(text) {
  if (!text || typeof text !== 'string') return false;
  for (const re of SECRET_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(text)) return true;
  }
  return false;
}

/**
 * Freshness: só conta execução em que o scanner determinou PASS|FAIL
 * e o cleanup (quando exigido) foi tratado/registrado.
 * Workflow iniciado ≠ execução válida.
 */
export function checkStale(lastRun, { now = Date.now(), staleAfterDays = 22 } = {}) {
  if (!lastRun || !lastRun.at) {
    return { status: 'STALE', reason: 'no_last_run_record' };
  }
  const scanOk = lastRun.scanStatus === 'PASS' || lastRun.scanStatus === 'FAIL';
  const finalOk = lastRun.status === 'PASS' || lastRun.status === 'FAIL';
  // Compat: last-runs antigos sem scanStatus usam status final
  const determined = lastRun.scanStatus ? scanOk : finalOk;
  if (!determined) {
    return { status: 'STALE', reason: `last_status_not_valid:${lastRun.status}` };
  }
  if (lastRun.cleanupRequired === true && lastRun.cleanupStatus !== 'PASS') {
    return {
      status: 'STALE',
      reason: `cleanup_not_ok:${lastRun.cleanupStatus || 'missing'}`,
    };
  }
  const ts = Date.parse(lastRun.at);
  if (Number.isNaN(ts)) return { status: 'STALE', reason: 'invalid_last_run_date' };
  const ageDays = (now - ts) / (86400 * 1000);
  if (ageDays > staleAfterDays) {
    return { status: 'STALE', reason: `age_days=${ageDays.toFixed(1)}>staleAfterDays=${staleAfterDays}` };
  }
  return { status: 'FRESH', reason: `age_days=${ageDays.toFixed(1)}`, ageDays };
}

/**
 * Decide estratégia de ambiente.
 * Preferência: EPHEMERAL_PREVIEW → EXISTING_NON_PROD → HUMAN_SETUP_REQUIRED.
 * Nunca seleciona produção automaticamente.
 */
export function resolveEnvironmentStrategy(config = {}, env = process.env) {
  const explicit = String(
    config.environmentStrategy || config.environmentMode || ''
  ).toUpperCase().replace(/-/g, '_');

  const hasPreviewCreds = Boolean(
    env.SUPABASE_ACCESS_TOKEN && env.SUPABASE_PARENT_PROJECT_REF
  );
  const hasStagingCreds = Boolean(
    (env.SUPABOMB_PROJECT_REF || config.target?.projectRef) &&
      env.SUPABOMB_ANON_KEY
  );

  const branchingAvailable =
    config.branching?.available === true ||
    explicit === 'EPHEMERAL_PREVIEW' ||
    String(config.environmentMode || '') === 'ephemeral-preview';

  const stagingAuthorized =
    config.existingNonProd?.authorized === true ||
    explicit === 'EXISTING_NON_PROD' ||
    String(config.environmentMode || '') === 'authorized-non-prod';

  if (explicit === 'HUMAN_SETUP_REQUIRED') {
    return {
      strategy: 'HUMAN_SETUP_REQUIRED',
      cleanupRequired: false,
      reason: 'config.environmentStrategy=HUMAN_SETUP_REQUIRED',
    };
  }

  // Explicit fallback staging (mesmo se parent token existir)
  if (explicit === 'EXISTING_NON_PROD') {
    if (!hasStagingCreds) {
      return {
        strategy: 'HUMAN_SETUP_REQUIRED',
        cleanupRequired: false,
        reason:
          'EXISTING_NON_PROD exige SUPABOMB_PROJECT_REF + SUPABOMB_ANON_KEY de staging/security-preview (nunca produção)',
      };
    }
    return {
      strategy: 'EXISTING_NON_PROD',
      cleanupRequired: false,
      reason: 'config.environmentStrategy=EXISTING_NON_PROD',
    };
  }

  // Preferência padrão: Preview Branch quando branching + credenciais parent
  if (branchingAvailable || explicit === 'EPHEMERAL_PREVIEW' || (explicit === '' && hasPreviewCreds)) {
    if (!hasPreviewCreds) {
      // Branching desejado mas sem token/parent → tenta fallback staging
      if (stagingAuthorized && hasStagingCreds) {
        return {
          strategy: 'EXISTING_NON_PROD',
          cleanupRequired: false,
          reason: 'preview_creds_missing_fallback_staging',
        };
      }
      return {
        strategy: 'HUMAN_SETUP_REQUIRED',
        cleanupRequired: false,
        reason:
          'EPHEMERAL_PREVIEW exige SUPABASE_ACCESS_TOKEN + SUPABASE_PARENT_PROJECT_REF (parent; não é alvo do scan)',
      };
    }
    return {
      strategy: 'EPHEMERAL_PREVIEW',
      cleanupRequired: true,
      reason: 'branching_available_with_parent_creds',
      parentProjectRefEnv: 'SUPABASE_PARENT_PROJECT_REF',
      accessTokenEnv: 'SUPABASE_ACCESS_TOKEN',
    };
  }

  if (stagingAuthorized || hasStagingCreds) {
    if (!hasStagingCreds) {
      return {
        strategy: 'HUMAN_SETUP_REQUIRED',
        cleanupRequired: false,
        reason:
          'EXISTING_NON_PROD exige SUPABOMB_PROJECT_REF + SUPABOMB_ANON_KEY de staging/security-preview (nunca produção)',
      };
    }
    return {
      strategy: 'EXISTING_NON_PROD',
      cleanupRequired: false,
      reason: 'staging_or_security_preview_authorized',
    };
  }

  return {
    strategy: 'HUMAN_SETUP_REQUIRED',
    cleanupRequired: false,
    reason:
      'Sem Branching automatizável e sem staging autorizado — não criar projeto pago automaticamente',
  };
}

/** Bloqueia uso do project_ref de produção como alvo do scanner. */
export function assertNotProductionTarget(projectRef, config = {}) {
  const ref = String(projectRef || '').trim();
  if (!ref) {
    return { ok: false, reason: 'empty_project_ref' };
  }
  const forbidden = [
    ...(config.productionProjectRefs || []),
    ...(config.forbidProjectRefs || []),
    config.production?.projectRef,
  ]
    .filter(Boolean)
    .map((x) => String(x).trim());

  // Parent da Preview NÃO pode ser o alvo do scan
  const parent = config.parentProjectRef || config.branching?.parentProjectRef;
  if (parent && ref === String(parent).trim()) {
    return {
      ok: false,
      reason: 'target_equals_parent_project_ref — scan deve usar project_ref da Preview Branch',
    };
  }
  if (forbidden.includes(ref)) {
    return { ok: false, reason: 'production_or_forbidden_project_ref' };
  }
  if (config.forbidProduction !== false && config.target?.isProduction === true) {
    return { ok: false, reason: 'target_marked_isProduction' };
  }
  return { ok: true };
}

/**
 * Extrai somente chave client-side compatível com Supabomb pinado (legacy anon JWT).
 * Nunca retorna service_role/secret. Publishable sem anon → limitação explícita.
 */
export function extractClientKeyForSupabomb(apiKeys = []) {
  const list = Array.isArray(apiKeys) ? apiKeys : [];
  const anon = list.find(
    (k) =>
      k &&
      k.api_key &&
      (k.name === 'anon' ||
        (k.type === 'legacy' && String(k.name || '').toLowerCase() === 'anon'))
  );
  if (anon?.api_key) {
    return { key: anon.api_key, kind: 'legacy_anon', ok: true };
  }
  // Alguns payloads usam name "anon" sob type null
  const anonLoose = list.find(
    (k) => k?.api_key && String(k.name || '').toLowerCase() === 'anon'
  );
  if (anonLoose?.api_key) {
    return { key: anonLoose.api_key, kind: 'legacy_anon', ok: true };
  }
  const publishable = list.find((k) => k?.type === 'publishable' && k.api_key);
  if (publishable) {
    return {
      key: null,
      kind: 'publishable_only',
      ok: false,
      limitation:
        'Supabomb pinado espera anon JWT legacy; publishable-only sem anon → NÃO inventar compatibilidade; não usar secret/service_role',
    };
  }
  const elevated = list.find(
    (k) =>
      k?.api_key &&
      (k.type === 'secret' ||
        String(k.name || '').toLowerCase() === 'service_role' ||
        String(k.name || '').includes('service_role'))
  );
  if (elevated) {
    return {
      key: null,
      kind: 'elevated_only',
      ok: false,
      limitation: 'service_role/secret presentes mas anon ausente — proibido substituir',
    };
  }
  return { key: null, kind: 'missing', ok: false, limitation: 'anon_key_absent' };
}

/**
 * Status final = scan ⊕ cleanup.
 * Nunca: scan falhou + cleanup ok ⇒ PASS.
 * Cleanup FAIL com scan qualquer ⇒ INCOMPLETE (recurso potencialmente órfão).
 */
export function composeFinalStatus({
  scanStatus,
  cleanupStatus = 'N/A',
  cleanupRequired = false,
} = {}) {
  const scan = String(scanStatus || 'INCOMPLETE').toUpperCase();
  const cleanup = String(cleanupStatus || 'N/A').toUpperCase();

  if (cleanupRequired) {
    if (cleanup !== 'PASS') {
      return {
        status: 'INCOMPLETE',
        reason: `CLEANUP_FAIL:scan=${scan};cleanup=${cleanup};orphan_risk=true`,
        scanStatus: scan,
        cleanupStatus: cleanup,
      };
    }
  }

  if (scan === 'PASS') {
    return { status: 'PASS', reason: 'scan_pass_cleanup_ok', scanStatus: scan, cleanupStatus: cleanup };
  }
  if (scan === 'FAIL') {
    return {
      status: 'FAIL',
      reason: 'scan_fail_findings_or_policy',
      scanStatus: scan,
      cleanupStatus: cleanup,
    };
  }
  return {
    status: 'INCOMPLETE',
    reason: `scan_${scan.toLowerCase()}`,
    scanStatus: scan,
    cleanupStatus: cleanup,
  };
}

/** Nome único de Preview Branch por execução CI. */
export function buildPreviewBranchName(runId) {
  const id = String(runId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  return `qsp-supabomb-${id || Date.now()}`;
}

/**
 * Cliente Management API (inyetável para self-test).
 * Endpoints oficiais:
 *  POST /v1/projects/{parent}/branches  (with_data:false)
 *  GET  /v1/branches/{branch_id_or_ref}
 *  GET  /v1/projects/{branch_ref}/api-keys?reveal=true
 *  DELETE /v1/branches/{branch_id_or_ref}
 */
export function createMgmtClient({
  token,
  baseUrl = process.env.SUPABOMB_MGMT_BASE_URL || MGMT_API_DEFAULT_BASE,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!token) {
    const err = new Error('SUPABASE_ACCESS_TOKEN_MISSING');
    err.code = 'SUPABASE_ACCESS_TOKEN_MISSING';
    throw err;
  }
  if (typeof fetchImpl !== 'function') {
    const err = new Error('FETCH_UNAVAILABLE');
    err.code = 'FETCH_UNAVAILABLE';
    throw err;
  }

  async function request(method, apiPath, body) {
    const url = `${String(baseUrl).replace(/\/$/, '')}${apiPath}`;
    const res = await fetchImpl(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text?.slice?.(0, 200) };
    }
    if (!res.ok) {
      const err = new Error(`MGMT_HTTP_${res.status}`);
      err.code = 'MGMT_HTTP';
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    createBranch(parentRef, { branchName, withData = false, persistent = false } = {}) {
      return request('POST', `/v1/projects/${parentRef}/branches`, {
        branch_name: branchName,
        with_data: withData === true, // default false — NÃO copiar dados de produção
        persistent: persistent === true,
      });
    },
    getBranch(branchIdOrRef) {
      return request('GET', `/v1/branches/${branchIdOrRef}`);
    },
    listBranches(parentRef) {
      return request('GET', `/v1/projects/${parentRef}/branches`);
    },
    getApiKeys(projectRef, { reveal = true } = {}) {
      const q = reveal ? '?reveal=true' : '';
      return request('GET', `/v1/projects/${projectRef}/api-keys${q}`);
    },
    deleteBranch(branchIdOrRef) {
      return request('DELETE', `/v1/branches/${branchIdOrRef}`);
    },
  };
}

/**
 * Poll até preview saudável (ACTIVE_HEALTHY / MIGRATIONS_PASSED+healthy).
 * Não usa sleep cego como única estratégia: polling com timeout.
 */
export async function waitForBranchHealthy(client, branchIdOrRef, {
  timeoutMs = 15 * 60 * 1000,
  intervalMs = 10_000,
  sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)),
  nowFn = () => Date.now(),
} = {}) {
  const started = nowFn();
  let last = null;
  while (nowFn() - started < timeoutMs) {
    last = await client.getBranch(branchIdOrRef);
    const previewStatus = last?.preview_project_status || last?.status;
    const branchStatus = last?.status;
    if (
      previewStatus === 'ACTIVE_HEALTHY' ||
      (branchStatus === 'MIGRATIONS_PASSED' && previewStatus === 'ACTIVE_HEALTHY') ||
      (branchStatus === 'FUNCTIONS_DEPLOYED' && previewStatus === 'ACTIVE_HEALTHY')
    ) {
      return { ok: true, branch: last, elapsedMs: nowFn() - started };
    }
    if (
      previewStatus === 'ACTIVE_UNHEALTHY' ||
      previewStatus === 'INIT_FAILED' ||
      branchStatus === 'MIGRATIONS_FAILED' ||
      branchStatus === 'FUNCTIONS_FAILED'
    ) {
      return {
        ok: false,
        reason: `branch_unhealthy:${branchStatus || ''}/${previewStatus || ''}`,
        branch: last,
        elapsedMs: nowFn() - started,
      };
    }
    await sleepFn(intervalMs);
  }
  return {
    ok: false,
    reason: 'branch_ready_timeout',
    branch: last,
    elapsedMs: nowFn() - started,
  };
}

/** Remove campos sensíveis de evidências publicáveis. */
export function stripSensitiveEvidence(obj) {
  const hits = [];
  const { sanitized } = (() => {
    // reusa redact via sanitizeReport shape
    return sanitizeReport(obj);
  })();
  // Extra: nunca publicar project_ref / branch project refs em artifact
  function walk(v) {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const out = {};
      for (const [k, val] of Object.entries(v)) {
        if (
          /project_?ref|anon_?key|access_token|api_key|service_role|jwt|password|db_pass|db_host/i.test(
            k
          )
        ) {
          hits.push(`stripped:${k}`);
          out[k] = '[STRIPPED]';
        } else {
          out[k] = walk(val);
        }
      }
      return out;
    }
    return v;
  }
  return { safe: walk(sanitized), hits };
}

/** Evidência de artifact/log sem project_ref/key temporários. */
export function evidenceIsSafe(text) {
  if (!text) return true;
  if (containsLikelySecret(text)) return false;
  // Heurística: JWT-like já coberto; bloquear padrões explícitos de key dump
  if (/SUPABOMB_ANON_KEY\s*[:=]/i.test(text)) return false;
  if (/SUPABASE_ACCESS_TOKEN\s*[:=]/i.test(text)) return false;
  return true;
}

export function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function walkHasSupabaseDir(root) {
  try {
    return detectSupabaseArchitecture(root);
  } catch {
    return { usesSupabase: false, evidence: [] };
  }
}

export function listFilesShallow(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((n) => {
    const full = path.join(dir, n);
    return { name: n, isDir: statSync(full).isDirectory() };
  });
}
