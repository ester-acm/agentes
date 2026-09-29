/**
 * Compõe status final scan ⊕ cleanup (fail-closed).
 * Env:
 *   SUPABOMB_SCAN_STATUS
 *   SUPABOMB_CLEANUP_STATUS
 *   SUPABOMB_CLEANUP_REQUIRED=true|false
 *   SUPABOMB_OUT_DIR
 *   SUPABOMB_LAST_RUN_JSON (opcional — merge)
 */
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  composeFinalStatus,
  loadJson,
  writeJson,
} from './supabomb-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = process.env.SUPABOMB_REPO_ROOT || path.resolve(here, '../../../..');
const outDir =
  process.env.SUPABOMB_OUT_DIR || path.join(repoRoot, 'security-reports/supabomb');
const lastPath =
  process.env.SUPABOMB_LAST_RUN_JSON || path.join(outDir, 'supabomb-last-run.json');

let previous = {};
if (existsSync(lastPath)) {
  try {
    previous = loadJson(lastPath);
  } catch {
    previous = {};
  }
}

const scanStatus =
  process.env.SUPABOMB_SCAN_STATUS || previous.scanStatus || previous.status || 'INCOMPLETE';
const cleanupRequired =
  String(process.env.SUPABOMB_CLEANUP_REQUIRED || previous.cleanupRequired || '') === 'true';
const cleanupStatus =
  process.env.SUPABOMB_CLEANUP_STATUS ||
  previous.cleanupStatus ||
  (cleanupRequired ? 'FAIL' : 'N/A');

const composed = composeFinalStatus({
  scanStatus,
  cleanupStatus,
  cleanupRequired,
});

mkdirSync(outDir, { recursive: true });
const lastRun = {
  ...previous,
  at: new Date().toISOString(),
  status: composed.status,
  reason: composed.reason,
  scanStatus: composed.scanStatus,
  cleanupStatus: composed.cleanupStatus,
  cleanupRequired,
  // Nunca persistir projectRef/keys em last-run publicado
  projectRef: undefined,
};
delete lastRun.projectRef;
delete lastRun.anonKey;

writeJson(lastPath, lastRun);
console.log(JSON.stringify(composed, null, 2));
process.exit(composed.status === 'PASS' ? 0 : 1);
