/**
 * Lifecycle Preview Branch Supabase — FAIL-CLOSED + cleanup always.
 *
 * Copiar para scripts/supabomb-preview.mjs e adaptar imports.
 *
 * Uso:
 *   node scripts/supabomb-preview.mjs <create|wait|keys|delete|status>
 *
 * Env:
 *   SUPABASE_ACCESS_TOKEN          (persistente — Management API)
 *   SUPABASE_PARENT_PROJECT_REF    (parent; NÃO é alvo do scan)
 *   SUPABOMB_CONFIG                docs/security/supabomb.config.json
 *   SUPABOMB_PREVIEW_STATE         path estado local (NÃO artifact)
 *   SUPABOMB_RUN_ID                github.run_id
 *   SUPABOMB_MGMT_BASE_URL         override (testes)
 *   SUPABOMB_BRANCH_TIMEOUT_MS     default 900000
 *   SUPABOMB_BRANCH_POLL_MS        default 10000
 *
 * with_data=false sempre no template (não clonar dados produtivos).
 */
import { mkdirSync, existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadJson,
  writeJson,
  createMgmtClient,
  waitForBranchHealthy,
  buildPreviewBranchName,
  extractClientKeyForSupabomb,
  assertNotProductionTarget,
  resolveEnvironmentStrategy,
} from './supabomb-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const action = (process.argv[2] || '').toLowerCase();
const repoRoot = process.env.SUPABOMB_REPO_ROOT || path.resolve(here, '../../../..');
const configPath =
  process.env.SUPABOMB_CONFIG || path.join(repoRoot, 'docs/security/supabomb.config.json');
const statePath =
  process.env.SUPABOMB_PREVIEW_STATE ||
  path.join(repoRoot, '.tmp-supabomb-preview/state.json');

function fail(reason, extra = {}) {
  const out = { ok: false, action, reason, ...extra, at: new Date().toISOString() };
  console.error(JSON.stringify(out, null, 2));
  process.exit(1);
}

function ok(payload) {
  console.log(JSON.stringify({ ok: true, action, ...payload, at: new Date().toISOString() }, null, 2));
}

function loadConfig() {
  if (!existsSync(configPath)) return {};
  try {
    return loadJson(configPath);
  } catch (e) {
    fail('CONFIG_INVALID', { message: e.message });
  }
}

function loadState() {
  if (!existsSync(statePath)) return null;
  return loadJson(statePath);
}

function saveState(state) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeJson(statePath, state);
}

function clientFromEnv() {
  const token = process.env.SUPABASE_ACCESS_TOKEN || '';
  if (!token) fail('SUPABASE_ACCESS_TOKEN_MISSING');
  return createMgmtClient({ token });
}

async function doCreate() {
  const config = loadConfig();
  const strategy = resolveEnvironmentStrategy(config, process.env);
  if (strategy.strategy !== 'EPHEMERAL_PREVIEW') {
    fail('STRATEGY_NOT_EPHEMERAL_PREVIEW', { strategy });
  }
  const parent =
    process.env.SUPABASE_PARENT_PROJECT_REF ||
    config.branching?.parentProjectRef ||
    config.parentProjectRef ||
    '';
  if (!parent) fail('PARENT_PROJECT_REF_MISSING');

  // Parent nunca é alvo — só origem da branch
  const branchName = buildPreviewBranchName(
    process.env.SUPABOMB_RUN_ID || process.env.GITHUB_RUN_ID
  );
  const client = clientFromEnv();
  const created = await client.createBranch(parent, {
    branchName,
    withData: false,
    persistent: false,
  });
  const state = {
    branchName,
    branchId: created.id,
    // project_ref fica só no state local (NÃO artifact)
    projectRef: created.project_ref,
    parentProjectRefPresent: true,
    withData: false,
    createdAt: new Date().toISOString(),
    cleanupStatus: 'PENDING',
    status: created.status || 'CREATING_PROJECT',
  };
  saveState(state);
  // Outputs sem keys
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `branch_name=${branchName}\nbranch_id=${created.id}\ncleanup_required=true\n`
    );
  }
  ok({
    branchName,
    branchId: created.id,
    note: 'project_ref obtido; não impresso. with_data=false.',
  });
}

async function doWait() {
  const state = loadState();
  if (!state?.branchId && !state?.projectRef) fail('PREVIEW_STATE_MISSING');
  const client = clientFromEnv();
  const timeoutMs = Number(process.env.SUPABOMB_BRANCH_TIMEOUT_MS || 900_000);
  const intervalMs = Number(process.env.SUPABOMB_BRANCH_POLL_MS || 10_000);
  const result = await waitForBranchHealthy(client, state.branchId || state.projectRef, {
    timeoutMs,
    intervalMs,
  });
  state.wait = {
    ok: result.ok,
    reason: result.reason || null,
    elapsedMs: result.elapsedMs,
    preview_project_status: result.branch?.preview_project_status || null,
    status: result.branch?.status || null,
  };
  if (result.branch?.project_ref) state.projectRef = result.branch.project_ref;
  if (result.branch?.ref && !state.projectRef) state.projectRef = result.branch.ref;
  saveState(state);
  if (!result.ok) fail(result.reason || 'branch_not_ready', { elapsedMs: result.elapsedMs });
  ok({ elapsedMs: result.elapsedMs, healthy: true });
}

async function doKeys() {
  const config = loadConfig();
  const state = loadState();
  if (!state?.projectRef) fail('PREVIEW_PROJECT_REF_MISSING');

  const guard = assertNotProductionTarget(state.projectRef, {
    ...config,
    parentProjectRef:
      process.env.SUPABASE_PARENT_PROJECT_REF ||
      config.branching?.parentProjectRef ||
      config.parentProjectRef,
  });
  if (!guard.ok) fail(guard.reason);

  const client = clientFromEnv();
  const keys = await client.getApiKeys(state.projectRef, { reveal: true });
  const extracted = extractClientKeyForSupabomb(keys);
  if (!extracted.ok) {
    fail('CLIENT_KEY_UNAVAILABLE', {
      kind: extracted.kind,
      limitation: extracted.limitation,
    });
  }

  // Exporta para steps seguintes via GITHUB_ENV (mascarar no workflow)
  if (process.env.GITHUB_ENV) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(
      process.env.GITHUB_ENV,
      `SUPABOMB_PROJECT_REF=${state.projectRef}\nSUPABOMB_ANON_KEY=${extracted.key}\n`
    );
  }
  if (process.env.GITHUB_OUTPUT) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_OUTPUT, `key_kind=${extracted.kind}\n`);
  }
  // NÃO imprimir key/ref
  ok({ keyKind: extracted.kind, masked: true });
}

async function doDelete() {
  const state = loadState() || {};
  const started = Date.now();
  if (!state.branchId && !state.projectRef) {
    // Nada a limpar — ainda assim registrar
    const out = {
      cleanupStatus: 'PASS',
      reason: 'nothing_to_cleanup',
      durationMs: 0,
    };
    writeCleanupRecord(out);
    ok(out);
    return;
  }
  try {
    const client = clientFromEnv();
    await client.deleteBranch(state.branchId || state.projectRef);
    const out = {
      cleanupStatus: 'PASS',
      reason: 'branch_deleted',
      durationMs: Date.now() - started,
      branchName: state.branchName || null,
    };
    state.cleanupStatus = 'PASS';
    state.cleanupAt = new Date().toISOString();
    state.cleanupDurationMs = out.durationMs;
    saveState(state);
    writeCleanupRecord(out);
    // Remover state local (contém project_ref)
    try {
      unlinkSync(statePath);
    } catch {
      /* ignore */
    }
    ok(out);
  } catch (e) {
    const out = {
      cleanupStatus: 'FAIL',
      reason: e.message || 'cleanup_error',
      durationMs: Date.now() - started,
      orphanRisk: true,
      branchName: state.branchName || null,
    };
    state.cleanupStatus = 'FAIL';
    state.cleanupError = String(e.message || e).slice(0, 200);
    saveState(state);
    writeCleanupRecord(out);
    fail('CLEANUP_FAIL', out);
  }
}

function writeCleanupRecord(out) {
  const outDir =
    process.env.SUPABOMB_OUT_DIR || path.join(repoRoot, 'security-reports/supabomb');
  mkdirSync(outDir, { recursive: true });
  // Sem project_ref / keys
  writeJson(path.join(outDir, 'supabomb-cleanup.json'), {
    at: new Date().toISOString(),
    cleanupStatus: out.cleanupStatus,
    reason: out.reason,
    durationMs: out.durationMs,
    branchName: out.branchName || null,
    orphanRisk: out.orphanRisk === true,
  });
}

function doStatus() {
  const config = loadConfig();
  const strategy = resolveEnvironmentStrategy(config, process.env);
  ok({ strategy });
}

const handlers = {
  create: doCreate,
  wait: doWait,
  keys: doKeys,
  delete: doDelete,
  cleanup: doDelete,
  status: async () => doStatus(),
};

if (!handlers[action]) {
  fail('USAGE', { usage: 'create|wait|keys|delete|status' });
}

handlers[action]().catch((e) => {
  fail(e.message || 'unexpected', { code: e.code, status: e.status });
});
