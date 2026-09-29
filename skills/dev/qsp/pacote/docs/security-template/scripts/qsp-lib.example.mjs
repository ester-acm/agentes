/**
 * Biblioteca compartilhada do template QSP V1.1 (copiar para scripts/qsp-lib.mjs no projeto).
 * Fail-closed: mapa inválido / ausente → throw (caller exit 1).
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const ALLOWED_FREQUENCIES = ['ALWAYS', 'IMPACT', 'PERIODIC', 'HUMAN'];
export const ALLOWED_PILLARS = ['QUALITY', 'SECURITY', 'PERFORMANCE'];
export const ALLOWED_CRITICALITY = ['critical', 'high', 'medium', 'low'];

export function matchGlob(file, glob) {
  const f = file.replace(/\\/g, '/');
  if (glob === '**/*') return true;
  const re = new RegExp(
    '^' +
      glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '§§')
        .replace(/\*/g, '[^/]*')
        .replace(/§§/g, '.*') +
      '$'
  );
  return re.test(f);
}

export function loadMap(mapPath) {
  if (!existsSync(mapPath)) {
    const err = new Error(`MAP_MISSING:${mapPath}`);
    err.code = 'MAP_MISSING';
    throw err;
  }
  let map;
  try {
    map = JSON.parse(readFileSync(mapPath, 'utf8'));
  } catch (e) {
    const err = new Error(`MAP_INVALID_JSON:${e.message}`);
    err.code = 'MAP_INVALID';
    throw err;
  }
  return map;
}

/**
 * Validação estrutural do mapa. Retorna { ok, errors[] }.
 */
export function validateMap(map) {
  const errors = [];
  if (!map || typeof map !== 'object') {
    return { ok: false, errors: ['map_not_object'] };
  }
  if (!Array.isArray(map.controls) || map.controls.length === 0) {
    errors.push('controls_empty');
  }
  const ids = new Set();
  for (const c of map.controls || []) {
    const prefix = `control:${c?.id || '?'}`;
    if (!c?.id || typeof c.id !== 'string') errors.push(`${prefix}:missing_id`);
    else if (ids.has(c.id)) errors.push(`${prefix}:duplicate_id`);
    else ids.add(c.id);

    if (!ALLOWED_PILLARS.includes(c.pillar)) errors.push(`${prefix}:bad_pillar`);
    if (!c.surface || typeof c.surface !== 'string') errors.push(`${prefix}:missing_surface`);
    if (!ALLOWED_CRITICALITY.includes(c.criticality)) errors.push(`${prefix}:bad_criticality`);
    if (!ALLOWED_FREQUENCIES.includes(c.frequency)) errors.push(`${prefix}:bad_frequency`);
    if (!c.evidence || typeof c.evidence !== 'string') errors.push(`${prefix}:missing_evidence`);
    if (!c.status) errors.push(`${prefix}:missing_status`);

    const automatable = c.frequency !== 'HUMAN';
    const critical = c.criticality === 'critical' || c.criticality === 'high';
    const hasExecutor =
      (typeof c.command === 'string' && c.command.trim().length > 0) ||
      (typeof c.executor === 'string' && c.executor.trim().length > 0);

    if (automatable && critical && !hasExecutor && c.status === 'active') {
      errors.push(`${prefix}:critical_automatable_without_executor`);
    }
    if (c.frequency === 'IMPACT' && c.status === 'active') {
      if (!Array.isArray(c.impactPaths) || c.impactPaths.length === 0) {
        errors.push(`${prefix}:impact_without_impactPaths`);
      }
    }
    if (c.frequency === 'HUMAN' && c.status === 'active') {
      if (!c.humanJustification || String(c.humanJustification).trim().length < 8) {
        errors.push(`${prefix}:human_without_justification`);
      }
    }
    // Baseline-only forbidden marker
    if (c.frequency === 'BASELINE_ONLY' || c.protection === 'baseline-only') {
      errors.push(`${prefix}:baseline_only_forbidden`);
    }
  }

  if (!Array.isArray(map.globalImpactPaths)) {
    // optional but recommended — warn as soft? User asked projects can define — empty ok
  }

  return { ok: errors.length === 0, errors };
}

export function walkFiles(rootDir, { ignoreDirNames = new Set() } = {}) {
  const out = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (ignoreDirNames.has(name)) continue;
      const p = path.join(dir, name);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(p);
      else out.push(path.relative(rootDir, p).replace(/\\/g, '/'));
    }
  }
  walk(rootDir);
  return out;
}

export function isGlobalChange(files, globalPaths = []) {
  return files.some((f) => globalPaths.some((g) => matchGlob(f, g)));
}
