/**
 * QSP Gate agregador — contrato inequívoco V1.1.
 *
 * FAIL se:
 * - obrigatório failure / cancelled / skipped indevido / ausente
 * - coverage drift não OK
 * - mapa inválido / ausente
 * - controle aplicável sem executor (via validateMap)
 * - runtime IMPACT exigido sem success
 * - QSP_PLACEHOLDER=1
 *
 * Skip OK somente se id NÃO ∈ QSP_IMPACT_IDS (e frequência IMPACT).
 *
 * Env:
 *   QSP_COVERAGE_MAP
 *   QSP_JOB_RESULTS  JSON { quality, security_always, performance_always, coverage_drift, <controlId>: status }
 *   QSP_IMPACT_IDS   csv
 *   QSP_DRIFT_OK     true|false
 *   QSP_PLACEHOLDER  1 → fail
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMap, validateMap } from './qsp-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const mapPath =
  process.env.QSP_COVERAGE_MAP ||
  path.resolve(here, '../../../docs/security/qsp-coverage-map.json');

let map;
try {
  map = loadMap(mapPath);
} catch (e) {
  console.error('QSP GATE FAIL:', e.message);
  process.exit(1);
}

const v = validateMap(map);
if (!v.ok) {
  console.error('QSP GATE FAIL: mapa inválido');
  for (const err of v.errors) console.error('-', err);
  process.exit(1);
}

let results;
try {
  results = JSON.parse(process.env.QSP_JOB_RESULTS || '{}');
} catch {
  console.error('QSP GATE FAIL: QSP_JOB_RESULTS JSON inválido');
  process.exit(1);
}

if (!process.env.QSP_JOB_RESULTS || process.env.QSP_JOB_RESULTS.trim() === '') {
  console.error('QSP GATE FAIL: QSP_JOB_RESULTS ausente — não inferir sucesso');
  process.exit(1);
}

const impactIds = new Set(
  (process.env.QSP_IMPACT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
);
const driftOk = String(process.env.QSP_DRIFT_OK || '') === 'true';
const failures = [];

if (String(process.env.QSP_PLACEHOLDER || '') === '1') {
  failures.push('NÃO CONFIGURADO / INCOMPLETO:placeholder');
}

if (!driftOk) failures.push('coverage_drift_not_ok');

const alwaysJobs = ['quality', 'security_always', 'performance_always', 'coverage_drift'];
for (const j of alwaysJobs) {
  const st = results[j];
  if (st == null || st === '') {
    failures.push(`obrigatorio_ausente:${j}`);
    continue;
  }
  if (st === 'failure' || st === 'cancelled' || st === 'skipped') {
    failures.push(`obrigatorio_bad:${j}=${st}`);
  } else if (st !== 'success') {
    failures.push(`obrigatorio_unknown_status:${j}=${st}`);
  }
}

// IMPACT exigidos
for (const id of impactIds) {
  const st = results[id];
  if (st == null || st === '') {
    failures.push(`impact_obrigatorio_ausente:${id}`);
    continue;
  }
  if (st === 'skipped') {
    failures.push(`impact_obrigatorio_skipped:${id}`);
    continue;
  }
  if (st === 'failure' || st === 'cancelled') {
    failures.push(`impact_obrigatorio_bad:${id}=${st}`);
    continue;
  }
  if (st !== 'success') {
    failures.push(`impact_obrigatorio_unknown:${id}=${st}`);
  }
}

// IMPACT jobs conhecidos no mapa: se NÃO exigidos, skipped|absent OK; failure ainda FAIL
const impactControls = (map.controls || []).filter(
  (c) => c.frequency === 'IMPACT' && c.status === 'active'
);
for (const c of impactControls) {
  if (impactIds.has(c.id)) continue;
  const st = results[c.id];
  if (st === 'failure' || st === 'cancelled') {
    failures.push(`impact_nao_exigido_mas_falhou:${c.id}=${st}`);
  }
}

// Runtime obrigatório: controles IMPACT critical/high com requiresEphemeralStack
for (const c of impactControls) {
  if (!impactIds.has(c.id)) continue;
  if (c.requiresEphemeralStack && results[c.id] !== 'success') {
    failures.push(`runtime_obrigatorio_sem_sucesso:${c.id}`);
  }
}

if (failures.length) {
  console.error('QSP GATE FAIL');
  for (const f of failures) console.error('-', f);
  console.error(
    'QSP Gate verde ≠ zero bugs. Significa: controles exigidos para esta alteração executados e OK.'
  );
  process.exit(1);
}

console.log('QSP GATE PASS');
