/**
 * Avalia aplicabilidade Supabomb (N/A vs APPLICABLE).
 * Env:
 *   SUPABOMB_REPO_ROOT
 *   SUPABOMB_CONFIG (path)
 * Exit 0 sempre com JSON em stdout; status no campo status.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  detectSupabaseArchitecture,
  applicabilityFromDetection,
  loadJson,
} from './supabomb-lib.example.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.SUPABOMB_REPO_ROOT || path.resolve(here, '../../../..');
let config = null;
if (process.env.SUPABOMB_CONFIG) {
  try {
    config = loadJson(process.env.SUPABOMB_CONFIG);
  } catch (e) {
    console.error(JSON.stringify({ status: 'INCOMPLETE', reason: e.message }));
    process.exit(1);
  }
}

const detection = detectSupabaseArchitecture(root);
const app = applicabilityFromDetection(detection, config);
const out = { ...app, detection };
console.log(JSON.stringify(out, null, 2));
if (app.status === 'INCOMPLETE') process.exit(1);
