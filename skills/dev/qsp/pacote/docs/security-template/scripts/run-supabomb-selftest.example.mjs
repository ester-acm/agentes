/**
 * Self-test A–H — estratégia Preview Branch + fallbacks (sem sistemas reais).
 * Uso: node docs/security-template/scripts/run-supabomb-selftest.example.mjs
 */
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  writeFileSync,
  mkdtempSync,
  rmSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  sanitizeReport,
  containsLikelySecret,
  evaluateReport,
  resolveEnvironmentStrategy,
  composeFinalStatus,
  createMgmtClient,
  waitForBranchHealthy,
  extractClientKeyForSupabomb,
  assertNotProductionTarget,
  buildPreviewBranchName,
  evidenceIsSafe,
  stripSensitiveEvidence,
  checkStale,
} from './supabomb-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, '../fixtures/supabomb');
const node = process.execPath;
const results = [];

function check(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ` — ${detail}` : ''}`);
}

function run(script, env = {}) {
  const r = spawnSync(node, [path.join(here, script)], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return { code: r.status ?? 1, out: (r.stdout || '') + (r.stderr || '') };
}

/** Mock fetch roteado por path — Lifecycle Preview sem rede. */
function makeMockFetch(scenario = 'happy') {
  const state = {
    created: false,
    deleted: false,
    branchId: 'br-mock-1',
    projectRef: 'preview-ref-mock',
    polls: 0,
  };
  const fetchImpl = async (url, init = {}) => {
    const u = String(url);
    const method = (init.method || 'GET').toUpperCase();
    const json = (body, status = 200) => ({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    });

    if (method === 'POST' && /\/branches$/.test(u)) {
      state.created = true;
      if (scenario === 'create_fail') return json({ message: 'no' }, 500);
      return json({
        id: state.branchId,
        name: 'qsp-supabomb-1',
        project_ref: state.projectRef,
        parent_project_ref: 'parent-ref',
        status: 'CREATING_PROJECT',
        preview_project_status: 'COMING_UP',
        with_data: false,
      }, 201);
    }
    if (method === 'GET' && u.includes('/branches/')) {
      state.polls += 1;
      if (scenario === 'never_healthy') {
        return json({
          id: state.branchId,
          ref: state.projectRef,
          status: 'RUNNING_MIGRATIONS',
          preview_project_status: 'COMING_UP',
        });
      }
      return json({
        id: state.branchId,
        ref: state.projectRef,
        project_ref: state.projectRef,
        status: 'MIGRATIONS_PASSED',
        preview_project_status: 'ACTIVE_HEALTHY',
      });
    }
    if (method === 'GET' && u.includes('/api-keys')) {
      if (scenario === 'publishable_only') {
        return json([{ name: 'default', type: 'publishable', api_key: 'sb_publishable_mock' }]);
      }
      return json([
        {
          name: 'anon',
          type: 'legacy',
          api_key:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMH0.signaturepadpadpadpadpad',
        },
        { name: 'service_role', type: 'legacy', api_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service.role' },
      ]);
    }
    if (method === 'DELETE' && u.includes('/branches/')) {
      if (scenario === 'cleanup_fail') return json({ message: 'nope' }, 500);
      state.deleted = true;
      return json({ message: 'ok' });
    }
    return json({ message: 'not_mocked', url: u }, 404);
  };
  return { fetchImpl, state };
}

// A: Preview → credenciais dinâmicas → scan → cleanup
{
  const { fetchImpl, state } = makeMockFetch('happy');
  const client = createMgmtClient({ token: 'tok', fetchImpl, baseUrl: 'https://mock.local' });
  const created = await client.createBranch('parent-ref', {
    branchName: buildPreviewBranchName('42'),
    withData: false,
  });
  const wait = await waitForBranchHealthy(client, created.id, {
    timeoutMs: 1000,
    intervalMs: 1,
    sleepFn: async () => {},
  });
  const keys = await client.getApiKeys(created.project_ref, { reveal: true });
  const extracted = extractClientKeyForSupabomb(keys);
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'supabomb-a-'));
  const r = run('supabomb-run.example.mjs', {
    SUPABOMB_DRY_RUN: '1',
    SUPABOMB_MODE: 'evaluate-only',
    SUPABOMB_REPO_ROOT: path.join(fixtures, 'arch-supabase'),
    SUPABOMB_CONFIG: path.join(fixtures, 'config-complete.json'),
    SUPABOMB_REPORT_JSON: path.join(fixtures, 'report-clean.json'),
    SUPABOMB_OUT_DIR: tmp,
    SUPABASE_ACCESS_TOKEN: 'tok',
    SUPABASE_PARENT_PROJECT_REF: 'parent-ref',
  });
  await client.deleteBranch(created.id);
  const final = composeFinalStatus({
    scanStatus: r.code === 0 ? 'PASS' : 'FAIL',
    cleanupStatus: state.deleted ? 'PASS' : 'FAIL',
    cleanupRequired: true,
  });
  check(
    'A_preview_scan_cleanup',
    state.created &&
      wait.ok &&
      extracted.ok &&
      extracted.kind === 'legacy_anon' &&
      state.deleted &&
      final.status === 'PASS',
    `created=${state.created} wait=${wait.ok} key=${extracted.kind} deleted=${state.deleted} final=${final.status}`
  );
  rmSync(tmp, { recursive: true, force: true });
}

// B: scan FAIL → cleanup ainda executa → final FAIL (não PASS)
{
  const { fetchImpl, state } = makeMockFetch('happy');
  const client = createMgmtClient({ token: 'tok', fetchImpl, baseUrl: 'https://mock.local' });
  await client.createBranch('parent', { branchName: 'qsp-supabomb-b' });
  const evalHigh = evaluateReport(
    JSON.parse(readFileSync(path.join(fixtures, 'report-high.json'), 'utf8')),
    { failOnHigh: true }
  );
  await client.deleteBranch('br-mock-1');
  const final = composeFinalStatus({
    scanStatus: evalHigh.status,
    cleanupStatus: state.deleted ? 'PASS' : 'FAIL',
    cleanupRequired: true,
  });
  check(
    'B_scan_fail_cleanup_runs',
    evalHigh.status === 'FAIL' && state.deleted && final.status === 'FAIL',
    `scan=${evalHigh.status} deleted=${state.deleted} final=${final.status}`
  );
}

// C: scan crash → cleanup executa → INCOMPLETE
{
  const { fetchImpl, state } = makeMockFetch('happy');
  const client = createMgmtClient({ token: 'tok', fetchImpl, baseUrl: 'https://mock.local' });
  await client.createBranch('parent', { branchName: 'qsp-supabomb-c' });
  await client.deleteBranch('br-mock-1');
  const final = composeFinalStatus({
    scanStatus: 'INCOMPLETE',
    cleanupStatus: state.deleted ? 'PASS' : 'FAIL',
    cleanupRequired: true,
  });
  check(
    'C_scan_crash_cleanup_runs',
    state.deleted && final.status === 'INCOMPLETE',
    `deleted=${state.deleted} final=${final.status}`
  );
}

// D: cleanup falha → workflow não fica verde
{
  const { fetchImpl } = makeMockFetch('cleanup_fail');
  const client = createMgmtClient({ token: 'tok', fetchImpl, baseUrl: 'https://mock.local' });
  await client.createBranch('parent', { branchName: 'qsp-supabomb-d' });
  let cleanupStatus = 'PASS';
  try {
    await client.deleteBranch('br-mock-1');
  } catch {
    cleanupStatus = 'FAIL';
  }
  const finalPassScan = composeFinalStatus({
    scanStatus: 'PASS',
    cleanupStatus,
    cleanupRequired: true,
  });
  check(
    'D_cleanup_fail_not_green',
    cleanupStatus === 'FAIL' && finalPassScan.status === 'INCOMPLETE',
    `cleanup=${cleanupStatus} final=${finalPassScan.status}`
  );
}

// E: Branching indisponível + staging → EXISTING_NON_PROD
{
  const cfg = JSON.parse(readFileSync(path.join(fixtures, 'config-staging-fallback.json'), 'utf8'));
  const s = resolveEnvironmentStrategy(cfg, {
    SUPABOMB_PROJECT_REF: 'fixture-staging-ref',
    SUPABOMB_ANON_KEY: 'fixture-anon',
  });
  check(
    'E_fallback_staging',
    s.strategy === 'EXISTING_NON_PROD' && s.cleanupRequired === false,
    `strategy=${s.strategy}`
  );
}

// F: sem Branching + sem staging → HUMAN_SETUP_REQUIRED
{
  const cfg = JSON.parse(readFileSync(path.join(fixtures, 'config-human-setup.json'), 'utf8'));
  const s = resolveEnvironmentStrategy(cfg, {});
  check(
    'F_human_setup_required',
    s.strategy === 'HUMAN_SETUP_REQUIRED',
    `strategy=${s.strategy}`
  );
}

// G: produção nunca selecionada automaticamente
{
  const cfg = JSON.parse(readFileSync(path.join(fixtures, 'config-complete.json'), 'utf8'));
  const blocked = assertNotProductionTarget('fixture-production-ref', cfg);
  const parentBlocked = assertNotProductionTarget('fixture-parent-ref', {
    ...cfg,
    parentProjectRef: 'fixture-parent-ref',
  });
  const previewOk = assertNotProductionTarget('preview-ref-mock', {
    ...cfg,
    parentProjectRef: 'fixture-parent-ref',
  });
  const auto = resolveEnvironmentStrategy(
    { branching: { available: false }, existingNonProd: { authorized: false } },
    { SUPABASE_ACCESS_TOKEN: '', SUPABASE_PARENT_PROJECT_REF: '' }
  );
  check(
    'G_production_never_auto',
    !blocked.ok && !parentBlocked.ok && previewOk.ok && auto.strategy === 'HUMAN_SETUP_REQUIRED',
    `blocked=${blocked.reason}; parent=${parentBlocked.reason}; auto=${auto.strategy}`
  );
}

// H: nenhum project_ref/key temporário em artifact/log + sanitize
{
  const raw = JSON.parse(readFileSync(path.join(fixtures, 'report-with-secret.json'), 'utf8'));
  const { sanitized, redactionHits } = sanitizeReport(raw);
  const evidence = {
    status: 'PASS',
    environmentStrategy: 'EPHEMERAL_PREVIEW',
    projectRef: 'should-strip-me-abcdefgh',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaa.bbb',
    counts: { high: 0 },
  };
  const { safe, hits } = stripSensitiveEvidence(evidence);
  const text = JSON.stringify(safe);
  const pubOnly = extractClientKeyForSupabomb([
    { type: 'publishable', name: 'default', api_key: 'sb_publishable_x' },
  ]);
  check(
    'H_evidence_no_ref_or_key',
    !containsLikelySecret(JSON.stringify(sanitized)) &&
      evidenceIsSafe(text) &&
      safe.projectRef === '[STRIPPED]' &&
      (safe.anonKey === '[STRIPPED]' || safe.anonKey == null) &&
      !pubOnly.ok &&
      redactionHits.length + hits.length > 0,
    `safe projectRef=${safe.projectRef} pubOnly=${pubOnly.kind}`
  );

  // stale exige cleanup quando required
  const staleCleanup = checkStale({
    at: new Date().toISOString(),
    status: 'PASS',
    scanStatus: 'PASS',
    cleanupRequired: true,
    cleanupStatus: 'FAIL',
  });
  const fresh = checkStale(
    JSON.parse(readFileSync(path.join(fixtures, 'last-run-fresh.json'), 'utf8'))
  );
  check(
    'H_stale_requires_cleanup',
    staleCleanup.status === 'STALE' && fresh.status === 'FRESH',
    `stale=${staleCleanup.reason} fresh=${fresh.status}`
  );
}

const failed = results.filter((x) => !x.ok);
console.log('\n=== SUPABOMB SELFTEST SUMMARY ===');
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  for (const f of failed) console.error('FAIL', f.id, f.detail);
  process.exit(1);
}
console.log('SUPABOMB TEMPLATE SELFTEST PASS');
