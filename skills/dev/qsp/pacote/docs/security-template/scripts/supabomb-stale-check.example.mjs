/**
 * Verifica stale execution do Supabomb.
 * Env:
 *   SUPABOMB_LAST_RUN_JSON
 *   SUPABOMB_STALE_AFTER_DAYS (default 22)
 * Exit 0 = FRESH; Exit 1 = STALE/INCOMPLETE
 */
import { loadJson, checkStale } from './supabomb-lib.example.mjs';

const path = process.env.SUPABOMB_LAST_RUN_JSON;
if (!path) {
  console.error(JSON.stringify({ status: 'STALE', reason: 'SUPABOMB_LAST_RUN_JSON ausente' }));
  process.exit(1);
}

let last;
try {
  last = loadJson(path);
} catch (e) {
  console.error(JSON.stringify({ status: 'STALE', reason: e.message }));
  process.exit(1);
}

const days = Number(process.env.SUPABOMB_STALE_AFTER_DAYS || 22);
const result = checkStale(last, { staleAfterDays: days });
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === 'FRESH' ? 0 : 1);
