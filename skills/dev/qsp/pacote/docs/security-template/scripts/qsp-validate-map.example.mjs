/**
 * Valida estrutura do mapa QSP. Fail-closed.
 * Uso: node scripts/qsp-validate-map.mjs
 * Env: QSP_COVERAGE_MAP
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadMap, validateMap } from './qsp-lib.example.mjs';

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

const { ok, errors } = validateMap(map);
if (!ok) {
  console.error('MAPA QSP INVÁLIDO:');
  for (const err of errors) console.error('-', err);
  process.exit(1);
}

console.log('Mapa QSP estruturalmente válido:', mapPath);
