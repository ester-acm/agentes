/**
 * Sanitiza relatório Supabomb para artifact.
 * Recusa publicar se o arquivo de saída ainda contiver segredo óbvio.
 * Env:
 *   SUPABOMB_REPORT_JSON (in)
 *   SUPABOMB_SANITIZED_OUT (out)
 *   SUPABOMB_REFUSE_ON_SECRET=1 (default)
 */
import { loadJson, sanitizeReport, containsLikelySecret, writeJson } from './supabomb-lib.example.mjs';

const inPath = process.env.SUPABOMB_REPORT_JSON;
const outPath = process.env.SUPABOMB_SANITIZED_OUT;
if (!inPath || !outPath) {
  console.error('INCOMPLETE: SUPABOMB_REPORT_JSON e SUPABOMB_SANITIZED_OUT obrigatórios');
  process.exit(1);
}

let report;
try {
  report = loadJson(inPath);
} catch (e) {
  console.error('INCOMPLETE:', e.message);
  process.exit(1);
}

const { sanitized, redactionHits } = sanitizeReport(report);
const text = JSON.stringify(sanitized);
const refuse = String(process.env.SUPABOMB_REFUSE_ON_SECRET || '1') === '1';

if (refuse && containsLikelySecret(text)) {
  console.error('INCOMPLETE: sanitization detectou segredo residual — artifact NÃO publicado');
  console.error(JSON.stringify({ redactionHits }, null, 2));
  process.exit(1);
}

writeJson(outPath, { ...sanitized, redactionHits });
console.log(JSON.stringify({ ok: true, outPath, redactionHitsCount: redactionHits.length }, null, 2));
