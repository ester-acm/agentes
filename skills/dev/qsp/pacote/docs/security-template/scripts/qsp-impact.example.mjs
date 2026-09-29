/**
 * Resolve ALWAYS / IMPACT (com GLOBAL IMPACT) / skip.
 * Fail-closed se mapa ausente ou inválido.
 *
 * Env:
 *   QSP_COVERAGE_MAP
 *   QSP_CHANGED_FILES (newline-separated) — preferido em CI/fixtures
 *   QSP_BASE_REF
 */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMap, validateMap, matchGlob, isGlobalChange } from './qsp-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const mapPath =
  process.env.QSP_COVERAGE_MAP ||
  path.resolve(here, '../../../docs/security/qsp-coverage-map.json');

let map;
try {
  map = loadMap(mapPath);
} catch (e) {
  console.error('NÃO CONFIGURADO / INCOMPLETO:', e.message);
  process.exit(1);
}

const v = validateMap(map);
if (!v.ok) {
  console.error('MAPA QSP INVÁLIDO:');
  for (const err of v.errors) console.error('-', err);
  process.exit(1);
}

function changedFiles() {
  if (process.env.QSP_CHANGED_FILES != null && process.env.QSP_CHANGED_FILES !== '') {
    return process.env.QSP_CHANGED_FILES.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  try {
    const base = process.env.QSP_BASE_REF || 'origin/main';
    return execSync(`git diff --name-only ${base}...HEAD`, { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    console.error('NÃO CONFIGURADO / INCOMPLETO: sem QSP_CHANGED_FILES e git diff falhou');
    process.exit(1);
  }
}

const files = changedFiles();
const globalPaths = map.globalImpactPaths || [];
const globalHit = isGlobalChange(files, globalPaths);

function controlImpactHit(control) {
  if (control.frequency !== 'IMPACT' || control.status !== 'active') return false;
  if (globalHit) return true; // GLOBAL → amplia todos IMPACT ativos
  const globs = control.impactPaths || [];
  return files.some((f) => globs.some((g) => matchGlob(f, g)));
}

const always = map.controls.filter((c) => c.frequency === 'ALWAYS' && c.status === 'active');
const impact = map.controls.filter((c) => controlImpactHit(c));
const skipImpact = map.controls.filter(
  (c) => c.frequency === 'IMPACT' && c.status === 'active' && !controlImpactHit(c)
);
const human = map.controls.filter((c) => c.frequency === 'HUMAN' && c.status === 'active');
const periodic = map.controls.filter(
  (c) =>
    c.status === 'active' &&
    (c.frequency === 'PERIODIC' || c.alsoPeriodic === true)
);

const out = {
  changedFiles: files,
  globalImpact: globalHit,
  globalImpactPaths: globalPaths,
  always: always.map((c) => c.id),
  impact: impact.map((c) => c.id),
  skipImpact: skipImpact.map((c) => c.id),
  human: human.map((c) => c.id),
  periodic: periodic.map((c) => c.id),
};

console.log(JSON.stringify(out, null, 2));

const gh = process.env.GITHUB_OUTPUT;
if (gh) {
  const flag = (needle) =>
    impact.some((c) => c.id.includes(needle) || c.surface.includes(needle)) ? 'true' : 'false';
  const lines = [
    `global_impact=${globalHit ? 'true' : 'false'}`,
    `run_rls=${flag('rls')}`,
    `run_storage=${flag('storage')}`,
    `run_edge=${flag('edge')}`,
    `run_perf_db=${impact.some((c) => c.id === 'p-db' || c.surface === 'db-explain') ? 'true' : 'false'}`,
    `run_perf_edge=${impact.some((c) => c.id === 'p-edge' || c.surface === 'edge-latency') ? 'true' : 'false'}`,
    `impact_ids=${impact.map((c) => c.id).join(',')}`,
    `periodic_ids=${periodic.map((c) => c.id).join(',')}`,
  ];
  writeFileSync(gh, lines.join('\n') + '\n', { flag: 'a' });
}
