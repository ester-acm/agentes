/**
 * Self-test A–H do TEMPLATE QSP V1.1 (não é teste de produto).
 * Uso: node docs/security-template/scripts/run-template-selftest.example.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, '../fixtures/qsp');
const node = process.execPath;

function run(script, env = {}) {
  const r = spawnSync(node, [path.join(here, script)], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return {
    code: r.status ?? 1,
    out: (r.stdout || '') + (r.stderr || ''),
  };
}

const results = [];
function check(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail ? ` — ${detail}` : ''}`);
}

const validMap = path.join(fixtures, 'map-valid.json');
const badExecMap = path.join(fixtures, 'map-no-executor.json');

// A: mapa válido + jobs required success → Gate PASS
{
  const r = run('qsp-gate-aggregator.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_DRIFT_OK: 'true',
    QSP_IMPACT_IDS: '',
    QSP_JOB_RESULTS: JSON.stringify({
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
      's-rls-runtime': 'skipped',
      's-edge-authz': 'skipped',
      'p-db': 'skipped',
    }),
  });
  check('A_gate_pass_all_required', r.code === 0, `code=${r.code}`);
}

// B: ALWAYS falhou → Gate FAIL
{
  const r = run('qsp-gate-aggregator.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_DRIFT_OK: 'true',
    QSP_IMPACT_IDS: '',
    QSP_JOB_RESULTS: JSON.stringify({
      quality: 'failure',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
    }),
  });
  check('B_always_failure', r.code !== 0, `code=${r.code}`);
}

// C: IMPACT obrigatório skipped → FAIL
{
  const r = run('qsp-gate-aggregator.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_DRIFT_OK: 'true',
    QSP_IMPACT_IDS: 's-rls-runtime',
    QSP_JOB_RESULTS: JSON.stringify({
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
      's-rls-runtime': 'skipped',
    }),
  });
  check('C_impact_required_skipped', r.code !== 0, `code=${r.code}`);
}

// D: IMPACT não aplicável → skip aceito
{
  const r = run('qsp-gate-aggregator.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_DRIFT_OK: 'true',
    QSP_IMPACT_IDS: '',
    QSP_JOB_RESULTS: JSON.stringify({
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
      's-rls-runtime': 'skipped',
    }),
  });
  check('D_impact_skip_ok_when_not_required', r.code === 0, `code=${r.code}`);
}

// E: nova superfície sem cobertura → Drift FAIL
{
  const r = run('qsp-coverage-drift.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_DRIFT_MODE: 'pr',
    QSP_CHANGED_FILES: 'src/payments/checkout.ts\n',
  });
  check('E_drift_new_surface_gap', r.code !== 0, `code=${r.code}`);
}

// F: mapa crítico sem executor → validate FAIL
{
  const r = run('qsp-validate-map.example.mjs', {
    QSP_COVERAGE_MAP: badExecMap,
  });
  check('F_map_critical_no_executor', r.code !== 0, `code=${r.code}`);
}

// G: mudança global → IMPACT ampliado
{
  const r = run('qsp-impact.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_CHANGED_FILES: 'src/middleware/auth-guard.ts\n',
  });
  let parsed;
  try {
    parsed = JSON.parse(r.out.slice(r.out.indexOf('{')));
  } catch {
    parsed = null;
  }
  const ok =
    r.code === 0 &&
    parsed?.globalImpact === true &&
    Array.isArray(parsed?.impact) &&
    parsed.impact.includes('s-rls-runtime') &&
    parsed.impact.includes('s-edge-authz');
  check('G_global_amplifies_impact', ok, `global=${parsed?.globalImpact} impact=${parsed?.impact}`);
}

// H: PERIODIC faltando no full-repo sweep → FAIL
{
  const r = run('qsp-coverage-drift.example.mjs', {
    QSP_COVERAGE_MAP: validMap,
    QSP_DRIFT_MODE: 'full-repo',
    QSP_REPO_FILES: [
      'supabase/migrations/20260101_x.sql',
      'supabase/functions/create-user/index.ts',
      'package.json',
    ].join('\n'),
    // missing sec-periodic-audit and alsoPeriodic ids
    QSP_PERIODIC_EXECUTED_IDS: 'p-db',
  });
  check('H_periodic_missing_in_full_repo', r.code !== 0, `code=${r.code}`);
}

const failed = results.filter((x) => !x.ok);
console.log('\n=== TEMPLATE SELFTEST ===');
console.log(`${results.length - failed.length}/${results.length} passed`);
if (failed.length) {
  process.exit(1);
}
console.log('ALL A–H PASSED');
