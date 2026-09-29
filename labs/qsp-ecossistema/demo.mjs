/**
 * Demo prático do ecossistema único: agentes constroem, QSP julga a PR.
 *
 * Uso (na pasta labs/qsp-ecossistema):
 *   node demo.mjs
 *
 * Não sobe GitHub Actions. Roda os mesmos scripts do Gate com diffs inventados,
 * para você ver o que aconteceria em cada tipo de PR.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const scripts = path.join(here, 'scripts')
const mapOk = path.join(here, 'docs', 'security', 'qsp-coverage-map.json')
const node = process.execPath

function run(script, env = {}) {
  const r = spawnSync(node, [path.join(scripts, script)], {
    env: { ...process.env, QSP_COVERAGE_MAP: mapOk, ...env },
    encoding: 'utf8',
  })
  return {
    code: r.status ?? 1,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
    out: ((r.stdout || '') + (r.stderr || '')).trim(),
  }
}

function linha() {
  console.log('─'.repeat(64))
}

function titulo(n, t) {
  console.log('')
  linha()
  console.log(`${n}. ${t}`)
  linha()
}

function impacto(files) {
  const r = run('qsp-impact.mjs', { QSP_CHANGED_FILES: files.join('\n') })
  let data = {}
  try {
    data = JSON.parse(r.stdout || r.out)
  } catch {
    data = { erro: r.out, code: r.code }
  }
  return { ok: r.code === 0, data, raw: r.out }
}

function drift(files) {
  const r = run('qsp-coverage-drift.mjs', {
    QSP_DRIFT_MODE: 'pr',
    QSP_CHANGED_FILES: files.join('\n'),
  })
  return { ok: r.code === 0, out: r.out }
}

function gate({ impactIds, driftOk, jobs }) {
  const r = run('qsp-gate-aggregator.mjs', {
    QSP_IMPACT_IDS: impactIds,
    QSP_DRIFT_OK: driftOk ? 'true' : 'false',
    QSP_JOB_RESULTS: JSON.stringify(jobs),
  })
  return { ok: r.code === 0, out: r.out }
}

function explicar(imp, dr, gt) {
  const always = (imp.data.always || []).join(', ') || '(nenhum)'
  const impact = (imp.data.impact || []).join(', ') || '(nenhum — esta PR não dispara teste caro)'
  const skip = (imp.data.skipImpact || []).join(', ') || '(nenhum)'
  console.log(`  Arquivos da PR: ${(imp.data.changedFiles || []).join(', ') || '?'}`)
  console.log(`  Mudança global (auth/middleware/package.json)? ${imp.data.globalImpact ? 'SIM — amplia todo IMPACT' : 'não'}`)
  console.log(`  ALWAYS (toda PR): ${always}`)
  console.log(`  IMPACT (só o que esta PR tocou): ${impact}`)
  console.log(`  IMPACT pulado (ok): ${skip}`)
  console.log(`  Coverage drift: ${dr.ok ? 'ok — mapa cobre o que apareceu' : 'FALHOU — superfície nova sem proteção no mapa'}`)
  if (!dr.ok) console.log(`    ${dr.out.split('\n')[0]}`)
  console.log(`  QSP Gate: ${gt.ok ? 'PASS → READY FOR QA' : 'FAIL → NÃO vai para o /qa-senior'}`)
  if (!gt.ok) {
    for (const l of gt.out.split('\n').slice(0, 6)) console.log(`    ${l}`)
  }
  console.log(
    gt.ok
      ? '  Próximo: /qa-senior olha a feature (Ficha + impacto). Depois merge.'
      : '  Próximo: volta para o Dev. QA nem começa.',
  )
}

console.log('')
console.log('CLÍNICA DUAL — o que o QSP faz na PR (laboratório)')
console.log('Agentes fazem a mudança. Isto aqui é a máquina que julga depois do commit.')
console.log('Contrato: skills/dev/qsp/ECOSSISTEMA.md')

titulo(0, 'Primeira vez — ainda não existe mapa')
{
  const r = spawnSync(node, [path.join(scripts, 'qsp-impact.mjs')], {
    env: {
      ...process.env,
      QSP_COVERAGE_MAP: path.join(here, 'docs', 'security', 'mapa-que-nao-existe.json'),
      QSP_CHANGED_FILES: 'src/components/Button.tsx',
    },
    encoding: 'utf8',
  })
  console.log('  /equipe no kickoff: não achei docs/security/qsp-coverage-map.json')
  console.log('  Quem entra: /engenheiro-seguranca em MODO IMPLANTAÇÃO (Prompt Mestre)')
  console.log('  O que NÃO acontece: auditoria profunda nem correção de negócio')
  console.log('  HARD STOP: humano valida a Ficha. Só então o mapa e o workflow nascem.')
  console.log(`  Script agora: ${((r.stderr || r.stdout || '').trim().split('\n')[0]) || 'NÃO CONFIGURADO'}`)
  console.log('  Isto não é um agente julgando PR. É o alarme ainda não instalado.')
}

titulo(1, 'Alguém só mudou o texto de um botão')
{
  const files = ['src/components/Button.tsx']
  console.log('  Quem fez: /dev-senior (ou qualquer pessoa daqui a 6 meses).')
  console.log('  Commit + PR. O QSP olha o DIFF, não o sistema inteiro.')
  const imp = impacto(files)
  const dr = drift(files)
  const gt = gate({
    impactIds: (imp.data.impact || []).join(','),
    driftOk: dr.ok,
    jobs: {
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
      's-rls-runtime': 'skipped',
      'p-db': 'skipped',
    },
  })
  explicar(imp, dr, gt)
  console.log('  Leitura: botão não mexe em banco → RLS e perf de DB ficam de fora. Barato.')
}

titulo(2, 'Daqui a 6 meses alguém altera o G7 (migration)')
{
  const files = ['supabase/migrations/20260828_g7_report.sql']
  console.log('  O agente da pessoa AJUDOU a escrever a migration.')
  console.log('  O QSP pergunta: quebrou isolamento? precisa de teste de RLS? piorou o banco?')
  const imp = impacto(files)
  const dr = drift(files)
  const gt = gate({
    impactIds: (imp.data.impact || []).join(','),
    driftOk: dr.ok,
    jobs: {
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
      's-rls-runtime': 'success',
      'p-db': 'success',
    },
  })
  explicar(imp, dr, gt)
  console.log('  Leitura: G7 toca migration → IMPACT liga RLS runtime + perf de DB.')
  console.log('  Se o job de RLS falhasse, o Gate barraria ANTES do QA.')
}

titulo(3, 'Nasceu pagamento e ninguém atualizou o mapa')
{
  const files = ['src/payments/checkout.ts']
  console.log('  O Dev esqueceu o DoD: superfície nova sem entrada no mapa.')
  console.log('  Coverage drift existe exatamente para o caso “o agente não avisou”.')
  const imp = impacto(files)
  const dr = drift(files)
  const gt = gate({
    impactIds: (imp.data.impact || []).join(','),
    driftOk: dr.ok,
    jobs: {
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: dr.ok ? 'success' : 'failure',
      's-rls-runtime': 'skipped',
      'p-db': 'skipped',
    },
  })
  explicar(imp, dr, gt)
  console.log('  Conserto: criar controle payment-authz no mapa + teste. Aí o Gate pode passar.')
}

titulo(4, 'IMPACT exigido foi skipped no CI (falso verde)')
{
  const gt = gate({
    impactIds: 's-rls-runtime',
    driftOk: true,
    jobs: {
      quality: 'success',
      security_always: 'success',
      performance_always: 'success',
      coverage_drift: 'success',
      's-rls-runtime': 'skipped',
    },
  })
  console.log('  A PR tocou G7, o mapa pediu s-rls-runtime, o job pulou.')
  console.log(`  QSP Gate: ${gt.ok ? 'PASS (BUG do demo)' : 'FAIL — skip indevido não é verde'}`)
  if (!gt.ok) console.log(`  ${gt.out.split('\n').slice(0, 3).join(' | ')}`)
  console.log('  Por isso o julgamento é o agregador, não “lint passou”.')
}

console.log('')
linha()
console.log('Resumo')
linha()
console.log('  Primeira vez  → agente de segurança INSTALA o alarme (Ficha + mapa + CI).')
console.log('  PR de botão   → ALWAYS só. Não analisa o hospital inteiro.')
console.log('  PR do G7      → ALWAYS + IMPACT de banco.')
console.log('  Superfície nova sem mapa → drift vermelho. QA nem vê.')
console.log('  /qa-senior    → só depois do Gate verde. Não é o 13º membro; é o juiz humano.')
console.log('  /equipe       → não despacha um “agente QSP” para julgar a PR.')
console.log('')
console.log('Contrato para o time: skills/dev/qsp/ECOSSISTEMA.md')
console.log('Pacote do amigo:      skills/dev/qsp/pacote/')
console.log('')
