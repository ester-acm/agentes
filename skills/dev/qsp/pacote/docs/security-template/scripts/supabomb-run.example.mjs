/**
 * Orquestrador Supabomb — FAIL-CLOSED.
 *
 * Copiar para scripts/supabomb-run.mjs no projeto e adaptar.
 *
 * Modos:
 *   SUPABOMB_MODE=na|evaluate-only|full
 *   SUPABOMB_CONFIG=docs/security/supabomb.config.json
 *   SUPABOMB_REPORT_JSON= (evaluate-only / fixtures)
 *   SUPABOMB_DRY_RUN=1 → nunca clona/executa scanner real
 *
 * Se este example NÃO foi adaptado (enabled=false / sem secrets):
 *   → INCOMPLETE (exit 1) — nunca PASS.
 *
 * NÃO executa dump/query. NÃO usa service_role. NÃO aponta produção automaticamente.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadJson,
  detectSupabaseArchitecture,
  applicabilityFromDetection,
  evaluateReport,
  sanitizeReport,
  containsLikelySecret,
  writeJson,
  resolveEnvironmentStrategy,
  assertNotProductionTarget,
} from './supabomb-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pinPath = path.resolve(
  here,
  '../stack-examples/supabase/supabomb/SUPABOMB-PIN.json'
);

function failIncomplete(reason, extra = {}) {
  const out = { status: 'INCOMPLETE', reason, ...extra, at: new Date().toISOString() };
  console.error(JSON.stringify(out, null, 2));
  process.exit(1);
}

function emit(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

const mode = (process.env.SUPABOMB_MODE || 'full').toLowerCase();
const dryRun = String(process.env.SUPABOMB_DRY_RUN || '') === '1';
const repoRoot = process.env.SUPABOMB_REPO_ROOT || path.resolve(here, '../../../..');
const configPath =
  process.env.SUPABOMB_CONFIG ||
  path.join(repoRoot, 'docs/security/supabomb.config.json');

let pin;
try {
  pin = loadJson(pinPath);
} catch {
  failIncomplete('SUPABOMB_PIN_MISSING', { pinPath });
}

let config = null;
if (existsSync(configPath)) {
  try {
    config = loadJson(configPath);
  } catch (e) {
    failIncomplete('CONFIG_INVALID_JSON', { message: e.message });
  }
}

const detection = detectSupabaseArchitecture(repoRoot);
const app = applicabilityFromDetection(detection, config);

if (app.status === 'N/A' || mode === 'na') {
  emit({
    status: 'N/A',
    justification: app.justification,
    detection,
    pin: pin.pinnedCommitShort,
    at: new Date().toISOString(),
  });
  process.exit(0);
}

if (!config) {
  failIncomplete('HUMAN-SETUP-REQUIRED:config_ausente', {
    hint: 'Criar docs/security/supabomb.config.json a partir do example; configurar alvo NÃO produtivo autorizado + secrets GHA',
  });
}

if (config.enabled !== true) {
  failIncomplete('HUMAN-SETUP-REQUIRED:enabled=false', {
    hint: 'Ativar somente após autorização de staging/security-preview e secrets',
  });
}

const strategyInfo = resolveEnvironmentStrategy(config, process.env);
if (strategyInfo.strategy === 'HUMAN_SETUP_REQUIRED' && mode === 'full' && !dryRun) {
  failIncomplete('HUMAN-SETUP-REQUIRED', {
    reason: strategyInfo.reason,
    hint:
      'Preferência: Preview Branch (SUPABASE_ACCESS_TOKEN + SUPABASE_PARENT_PROJECT_REF). Fallback: staging via SUPABOMB_PROJECT_REF + SUPABOMB_ANON_KEY. Nunca produção.',
  });
}

if (
  mode === 'full' &&
  !dryRun &&
  !config.target?.projectRef &&
  !process.env.SUPABOMB_PROJECT_REF
) {
  failIncomplete('HUMAN-SETUP-REQUIRED:project_ref_ausente', {
    note: 'Em EPHEMERAL_PREVIEW o ref vem dinamicamente da Preview Branch (step keys), não de secret permanente.',
  });
}

const projectRef = process.env.SUPABOMB_PROJECT_REF || config.target?.projectRef || '';
const anonKey = process.env.SUPABOMB_ANON_KEY || '';

const prodGuard = assertNotProductionTarget(projectRef || 'missing', {
  ...config,
  parentProjectRef:
    process.env.SUPABASE_PARENT_PROJECT_REF ||
    config.branching?.parentProjectRef ||
    config.parentProjectRef,
});
if (!prodGuard.ok && mode === 'full' && !dryRun && projectRef) {
  failIncomplete(`FORBIDDEN_TARGET:${prodGuard.reason}`);
}

if (mode === 'evaluate-only' || dryRun) {
  if (!process.env.SUPABOMB_REPORT_JSON) {
    failIncomplete('evaluate-only exige SUPABOMB_REPORT_JSON (fixture/dry-run)');
  }
  let report;
  try {
    report = loadJson(process.env.SUPABOMB_REPORT_JSON);
  } catch (e) {
    failIncomplete('scanner_report_unreadable', { message: e.message });
  }
  const { sanitized, redactionHits } = sanitizeReport(report);
  const text = JSON.stringify(sanitized);
  if (containsLikelySecret(text)) {
    failIncomplete('sanitization_failed_secret_residual', { redactionHits });
  }
  const evalResult = evaluateReport(sanitized, config.policy || {});
  const outDir = process.env.SUPABOMB_OUT_DIR || path.join(repoRoot, 'security-reports/supabomb');
  mkdirSync(outDir, { recursive: true });
  writeJson(path.join(outDir, 'supabomb-sanitized.json'), { ...sanitized, redactionHits });
  writeJson(path.join(outDir, 'supabomb-last-run.json'), {
    at: new Date().toISOString(),
    status: evalResult.status,
    scanStatus: evalResult.status,
    reason: evalResult.reason,
    counts: evalResult.counts,
    pin: pin.pinnedCommit,
    environment: config.target?.label || 'dry-run',
    environmentStrategy: strategyInfo.strategy,
    cleanupRequired: false,
    cleanupStatus: 'N/A',
    mode: 'evaluate-only',
  });
  emit({ ...evalResult, pin: pin.pinnedCommitShort, dryRun: true });
  process.exit(evalResult.status === 'PASS' ? 0 : 1);
}

// full mode — credenciais dinâmicas (preview) ou staging autorizado; NUNCA prod automático
if (!anonKey) {
  failIncomplete('HUMAN-SETUP-REQUIRED:SUPABOMB_ANON_KEY ausente', {
    note:
      'EPHEMERAL_PREVIEW: obtida da Preview Branch via Management API. EXISTING_NON_PROD: secret staging. Nunca produção / service_role.',
  });
}

if (String(config.environmentMode || '') === 'ephemeral-local') {
  failIncomplete('UNSUPPORTED:ephemeral-local', {
    note: `Supabomb ${pin.packageVersion}@${pin.pinnedCommitShort} hardcoda base_url para https://{ref}.supabase.co — local/custom NÃO suportado. Use EPHEMERAL_PREVIEW (Preview Branch cloud) ou EXISTING_NON_PROD.`,
  });
}

const work = path.join(repoRoot, '.tmp-supabomb-tool');
mkdirSync(work, { recursive: true });
const cloneDir = path.join(work, 'supabomb');
if (existsSync(cloneDir)) {
  rmSync(cloneDir, { recursive: true, force: true });
}
mkdirSync(cloneDir, { recursive: true });

const origin = pin.origin || 'https://github.com/ModernPentest/supabomb';
const init = spawnSync('git', ['init'], { cwd: cloneDir, encoding: 'utf8' });
const remote = spawnSync('git', ['remote', 'add', 'origin', origin], {
  cwd: cloneDir,
  encoding: 'utf8',
});
const fetch = spawnSync(
  'git',
  ['fetch', '--depth', '1', 'origin', pin.pinnedCommit],
  { cwd: cloneDir, encoding: 'utf8' }
);
const checkout = spawnSync('git', ['checkout', 'FETCH_HEAD'], {
  cwd: cloneDir,
  encoding: 'utf8',
});
if (init.status !== 0 || remote.status !== 0 || fetch.status !== 0 || checkout.status !== 0) {
  failIncomplete('pin_checkout_failed', {
    init: (init.stderr || '').slice(0, 200),
    remote: (remote.stderr || '').slice(0, 200),
    fetch: (fetch.stderr || '').slice(0, 400),
    checkout: (checkout.stderr || '').slice(0, 400),
  });
}

const rawOut = path.join(work, 'raw-report.json');
const run = spawnSync(
  'uv',
  [
    'run',
    'supabomb',
    'test',
    '-p',
    projectRef,
    '-k',
    anonKey,
    '-o',
    rawOut,
  ],
  { cwd: cloneDir, encoding: 'utf8', env: { ...process.env } }
);

if (run.status !== 0 && !existsSync(rawOut)) {
  failIncomplete('scanner_crash', {
    status: run.status,
    stderr: (run.stderr || '').slice(0, 800),
  });
}

let report;
try {
  report = loadJson(rawOut);
} catch (e) {
  failIncomplete('scanner_report_missing', { message: e.message });
}

const { sanitized, redactionHits } = sanitizeReport(report);
if (containsLikelySecret(JSON.stringify(sanitized))) {
  failIncomplete('sanitization_failed_secret_residual', { redactionHits });
}

const evalResult = evaluateReport(sanitized, config.policy || {});
const outDir = process.env.SUPABOMB_OUT_DIR || path.join(repoRoot, 'security-reports/supabomb');
mkdirSync(outDir, { recursive: true });
writeJson(path.join(outDir, 'supabomb-sanitized.json'), { ...sanitized, redactionHits });
writeJson(path.join(outDir, 'supabomb-last-run.json'), {
  at: new Date().toISOString(),
  status: evalResult.status,
  scanStatus: evalResult.status,
  reason: evalResult.reason,
  counts: evalResult.counts,
  pin: pin.pinnedCommit,
  environmentStrategy: strategyInfo.strategy,
  environment: config.target?.label || strategyInfo.strategy,
  cleanupRequired: strategyInfo.cleanupRequired === true,
  cleanupStatus: 'PENDING',
  // NÃO gravar projectRef/anonKey em artifact
});
writeFileSync(
  path.join(outDir, 'supabomb-summary.md'),
  `# Supabomb\n\nstatus: ${evalResult.status}\nreason: ${evalResult.reason}\npin: ${pin.pinnedCommit}\nstrategy: ${strategyInfo.strategy}\n`
);

emit({
  ...evalResult,
  pin: pin.pinnedCommitShort,
  cliExit: run.status,
  note: 'CLI exit code NÃO é fonte de verdade para findings; avaliação é do wrapper.',
});
process.exit(evalResult.status === 'PASS' ? 0 : 1);
