/**
 * Avalia relatório Supabomb → PASS|FAIL|INCOMPLETE (fail-closed).
 * Env:
 *   SUPABOMB_REPORT_JSON  path
 *   SUPABOMB_POLICY_JSON  optional path or inline via SUPABOMB_POLICY
 *   SUPABOMB_SCANNER_ERROR
 *   SUPABOMB_MISSING_CONFIG
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadJson, evaluateReport, writeJson } from './supabomb-lib.example.mjs';

const reportPath = process.env.SUPABOMB_REPORT_JSON;
let report = null;
if (reportPath) {
  try {
    report = loadJson(reportPath);
  } catch (e) {
    const r = evaluateReport(null, {}, { scannerError: e.message });
    console.log(JSON.stringify(r, null, 2));
    process.exit(1);
  }
}

let policy = {};
if (process.env.SUPABOMB_POLICY) {
  policy = JSON.parse(process.env.SUPABOMB_POLICY);
} else if (process.env.SUPABOMB_POLICY_JSON) {
  policy = loadJson(process.env.SUPABOMB_POLICY_JSON);
}

const result = evaluateReport(report, policy, {
  scannerError: process.env.SUPABOMB_SCANNER_ERROR || undefined,
  missingConfig: process.env.SUPABOMB_MISSING_CONFIG || undefined,
});

console.log(JSON.stringify(result, null, 2));
if (process.env.SUPABOMB_EVAL_OUT) {
  writeJson(process.env.SUPABOMB_EVAL_OUT, result);
}

if (result.status === 'PASS') process.exit(0);
process.exit(1);
