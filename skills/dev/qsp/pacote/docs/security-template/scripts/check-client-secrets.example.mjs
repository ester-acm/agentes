/**
 * EXEMPLO — scanner de exposição de secrets no CLIENT / código de front.
 *
 * Copiar para scripts/ do projeto e adaptar CONFIG abaixo.
 * Uso: node scripts/check-client-secrets.mjs
 *
 * Escopo: SOMENTE exposição no client.
 * NÃO substitui:
 * - scanner de repositório;
 * - histórico Git;
 * - scanner de CI;
 * - scanner apropriado ao stack / risco.
 *
 * O agente deve escolher ferramentas adicionais quando o risco exigir.
 * Não assume um único framework. Ajuste roots, regras e allowlist.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Raiz do repositório — ajustar se o script não viver em /scripts */
const root = path.resolve(__dirname, '..');

/** Pastas/arquivos a varrer (relativos à raiz) */
const SCAN_ROOTS = [
  'src',
  'app',
  'pages',
  'components',
  'lib',
  'public',
  'web',
  'client',
  'frontend',
];

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'docs',
  'security-reports',
  'dist',
  'build',
  'coverage',
  '.next',
  'vendor',
]);

const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.vue', '.svelte', '.html', '.css', '.json', '.toml', '.env', '.txt',
]);

/**
 * Padrões proibidos no client.
 * Adicione regras do projeto; remova as que não se aplicam.
 */
const FORBIDDEN_RULES = [
  { id: 'service-role', description: 'SERVICE_ROLE / service role key', pattern: /SERVICE_ROLE/i },
  { id: 'private-key-block', description: 'Bloco BEGIN PRIVATE KEY', pattern: /BEGIN (RSA |EC )?PRIVATE KEY/ },
  { id: 'aws-access-key', description: 'Possível AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
  { id: 'generic-secret-env', description: 'PREFIXO_PUBLICO com SECRET/PRIVATE/SERVICE', pattern: /(?:VITE_|NEXT_PUBLIC_|PUBLIC_|REACT_APP_)[A-Z0-9_]*(SECRET|PRIVATE|SERVICE_ROLE)/i },
];

/** Arquivos ou trechos permitidos de propósito (rel path substring) */
const ALLOWLIST = [
  // 'src/config/public-keys.ts',
];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(name)) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (TEXT_EXT.has(path.extname(name)) || name.startsWith('.env')) files.push(full);
  }
  return files;
}

const targets = [];
for (const rel of SCAN_ROOTS) {
  const full = path.join(root, rel);
  if (!existsSync(full)) continue;
  const st = statSync(full);
  if (st.isDirectory()) walk(full, targets);
  else targets.push(full);
}

const hits = [];
for (const file of targets) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (ALLOWLIST.some((a) => rel.includes(a))) continue;
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  for (const rule of FORBIDDEN_RULES) {
    if (rule.pattern.test(text)) {
      hits.push({ file: rel, rule: rule.id, description: rule.description });
    }
  }
}

if (hits.length) {
  console.error('Client secrets scanner FAILED:');
  for (const h of hits) console.error(`- [${h.rule}] ${h.file}: ${h.description}`);
  process.exit(1);
}

console.log(`Client secrets scanner OK (${targets.length} files)`);
