/**
 * Coverage drift — PR (diff) ou FULL-REPO (periódico).
 *
 * Env:
 *   QSP_COVERAGE_MAP
 *   QSP_DRIFT_MODE=pr|full-repo   (default: pr)
 *   QSP_CHANGED_FILES             (modo pr)
 *   QSP_REPO_FILES                (modo full-repo; newline list — fixtures)
 *   QSP_REPO_ROOT                 (walk filesystem se REPO_FILES ausente)
 *   QSP_PERIODIC_EXECUTED_IDS     (modo full-repo: ids PERIODIC já executados no sweep)
 *
 * Exit 1 = COVERAGE GAP / INCOMPLETO — nunca falso verde.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadMap,
  validateMap,
  matchGlob,
  walkFiles,
} from './qsp-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const mapPath =
  process.env.QSP_COVERAGE_MAP ||
  path.resolve(here, '../../../docs/security/qsp-coverage-map.json');
const mode = (process.env.QSP_DRIFT_MODE || 'pr').toLowerCase();

let map;
try {
  map = loadMap(mapPath);
} catch (e) {
  console.error('COVERAGE GAP:', e.message);
  process.exit(1);
}

const v = validateMap(map);
if (!v.ok) {
  console.error('COVERAGE GAP: mapa inválido');
  for (const err of v.errors) console.error('-', err);
  process.exit(1);
}

const gaps = [];
const active = (map.controls || []).filter((c) => c.status === 'active');
const activeSurfaces = new Set(active.map((c) => c.surface));
const detectors = map.sensitiveSurfaceDetectors || [];

function listPrFiles() {
  if (process.env.QSP_CHANGED_FILES != null && process.env.QSP_CHANGED_FILES !== '') {
    return process.env.QSP_CHANGED_FILES.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  try {
    const base = process.env.QSP_BASE_REF || 'origin/main';
    return execSync(`git diff --name-only ${base}...HEAD`, { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    console.error('NÃO CONFIGURADO / INCOMPLETO: QSP_CHANGED_FILES ausente e git diff falhou');
    process.exit(1);
  }
}

function listRepoFiles() {
  if (process.env.QSP_REPO_FILES != null && process.env.QSP_REPO_FILES !== '') {
    return process.env.QSP_REPO_FILES.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  }
  const root = process.env.QSP_REPO_ROOT;
  if (!root) {
    console.error(
      'NÃO CONFIGURADO / INCOMPLETO: full-repo exige QSP_REPO_FILES ou QSP_REPO_ROOT'
    );
    process.exit(1);
  }
  const ignore = new Set([
    'node_modules',
    '.git',
    'dist',
    'coverage',
    'PACOTE-UNIVERSAL-SEGURANCA',
    'strix_runs',
    '.temp',
  ]);
  return walkFiles(root, { ignoreDirNames: ignore });
}

const files = mode === 'full-repo' ? listRepoFiles() : listPrFiles();

// 1) Superfície sensível presente sem cobertura no mapa
for (const det of detectors) {
  const hits = files.filter((f) => matchGlob(f, det.glob));
  if (!hits.length) continue;
  const required = det.requiresControlSurfaces || [];
  const missing = required.filter((s) => !activeSurfaces.has(s));
  if (missing.length) {
    gaps.push({
      type: 'surface_without_coverage',
      detector: det.id,
      files: hits.slice(0, 20),
      missingSurfaces: missing,
    });
  }
}

// 2) Controle aponta surfacePaths/sourceGlobs que não existem mais no repo (full-repo)
if (mode === 'full-repo') {
  for (const c of active) {
    const globs = c.surfacePaths || c.sourceGlobs || [];
    if (!globs.length) continue;
    const any = files.some((f) => globs.some((g) => matchGlob(f, g)));
    if (!any) {
      gaps.push({
        type: 'control_points_to_missing_surface',
        controlId: c.id,
        surface: c.surface,
        surfacePaths: globs,
      });
    }
  }

  // 3) Categoria crítica automatizável sem frequência válida (já no validateMap) —
  //    reforço: active + critical + sem ALWAYS/IMPACT/PERIODIC/HUMAN já coberto

  // 4) PERIODIC obrigatórios devem constar em QSP_PERIODIC_EXECUTED_IDS no sweep
  const periodicIds = active
    .filter((c) => c.frequency === 'PERIODIC' || c.alsoPeriodic === true)
    .filter((c) => c.frequency !== 'HUMAN')
    .map((c) => c.id);
  if (periodicIds.length) {
    if (process.env.QSP_PERIODIC_EXECUTED_IDS == null) {
      gaps.push({
        type: 'periodic_sweep_incomplete',
        detail: 'QSP_PERIODIC_EXECUTED_IDS ausente no full-repo sweep',
        required: periodicIds,
      });
    } else {
      const executed = new Set(
        process.env.QSP_PERIODIC_EXECUTED_IDS.split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
      const missing = periodicIds.filter((id) => !executed.has(id));
      if (missing.length) {
        gaps.push({
          type: 'periodic_control_not_executed',
          missing,
        });
      }
    }
  }
}

// 5) Frequência inválida residual
for (const c of active) {
  if (!['ALWAYS', 'IMPACT', 'PERIODIC', 'HUMAN'].includes(c.frequency)) {
    gaps.push({ type: 'bad_frequency', controlId: c.id, frequency: c.frequency });
  }
}

if (gaps.length) {
  console.error('COVERAGE GAP:');
  console.error(JSON.stringify(gaps, null, 2));
  process.exit(1);
}

console.log(`Coverage drift OK (mode=${mode}, files=${files.length}).`);
