export const meta = {
  name: 'equipe',
  description: 'Pipeline executável completo da equipe: 6 modos de operação (projeto-do-zero, feature-nova, bugfix, redesign, auditoria, resgate-de-projeto + classificação automática), gates com devolução (máx. 2), fan-out/fan-in com plano de execução por ownership, gate de craft com loop de correção, auditoria de segurança com re-verificação, loop de qualidade tester→QA com roteamento de bug por dimensão e diagnóstico estrutural em não-convergência. Usa /ui-ux-pro-max e /impeccable como ferramentas de frontend. Autônomo: PARA nos 4 gates humanos (escopo/custo/produção/dados) — deploy só executa se pré-autorizado via args.autorizadoDeploy.',
  whenToUse: 'Rodar o núcleo não-interativo do /equipe em qualquer projeto. Faça o kickoff você mesmo e passe as respostas em args (ou modo:"auto" para o workflow classificar). Deploy e ações pagas ficam para você autorizar — ou pré-autorize o deploy com autorizadoDeploy:true.',
  phases: [
    { title: 'Kickoff + EQUIPE.md' },
    { title: 'Classificar modo' },
    { title: 'Discovery (PRD)' },
    { title: 'Design + Arquitetura' },
    { title: 'Implementação' },
    { title: 'Gate de craft' },
    { title: 'Segurança' },
    { title: 'Qualidade (tester + QA)' },
    { title: 'Pré-deploy' },
    { title: 'Auditoria / Resgate' },
  ],
}

// ═════════════════════════════════════════════════════════════════════════════
// COMO INVOCAR (global — funciona de qualquer projeto)
//   Workflow({ name: "equipe", args: {...} })
//   O arquivo instalado vive em ~/.claude/workflows/equipe.js (fonte: skills/dev/equipe.workflow.js).
//
// KICKOFF (args) — substitui as perguntas interativas do /equipe:
//   {
//     brief:        "o que construir/consertar, em 1-3 frases",
//     publico:      "para quem",
//     plataforma:   "web" | "mobile" | "ambos",
//     modo:         "auto" | "projeto-do-zero" | "feature-nova" | "bugfix" | "redesign"
//                   | "auditoria" | "resgate-de-projeto",
//     temLLM:       true|false,   temPagamento: true|false,
//     tocaSensivel: true|false,   // auth / dados sensíveis / upload (aciona segurança na feature)
//     temMarca:     true|false,   // já existe design system? (se não, designers semeiam com /ui-ux-pro-max)
//     root:         ".",          // raiz do repo onde o EQUIPE.md e o código vivem
//     bug:          "descrição do bug (modo bugfix)",
//     restricoes:   "stack obrigatória, integrações, orçamento...",
//     dataCiclo:    "YYYY-MM-DD", // data usada nas decisões do EQUIPE.md (Date.now é indisponível aqui)
//     maxLoops:     3,            // voltas do loop de qualidade
//     maxDevolucoes: 2,           // devoluções por gate (doutrina do Playbook 3)
//     autorizadoDeploy: false,    // true = você PRÉ-AUTORIZA o deploy (Princípio 6 exige decisão sua;
//                                 //  esta flag É a decisão, dada por escrito no kickoff)
//   }
// Sem args, roda com placeholders — troque antes de valer como entrega.
//
// GATES HUMANOS: o workflow NUNCA cria serviço pago nem roda operação destrutiva em dados,
// em nenhuma hipótese. Deploy em produção só com autorizadoDeploy:true. Mudança de escopo
// vira pendência bloqueante, nunca decisão de agente.
//
// DESEMPENHO: EQUIPE.md gravado em 2 marcos (esqueleto no kickoff + consolidação final);
// gates validados por agente barato (effort low) com devolução dirigida — pega artefato furado
// cedo, que é onde o retrabalho custa menos. Guarda de orçamento de tokens nos loops.
// ═════════════════════════════════════════════════════════════════════════════
const cfg = (args && typeof args === 'object') ? args : {}
const ROOT = cfg.root || '.'
const EQUIPE = `${ROOT}/EQUIPE.md`
const plataforma = cfg.plataforma || 'web'
const brief = cfg.brief || '[SUPOSIÇÃO: brief não informado em args — trate como placeholder e sinalize]'
const publico = cfg.publico || '[não informado]'
const restricoes = cfg.restricoes || 'stack da casa: TypeScript, Next.js, React Native/Expo, Supabase, Vercel, Stripe'
const dataCiclo = cfg.dataCiclo || '[informe args.dataCiclo — YYYY-MM-DD]'
const temLLM = !!cfg.temLLM
const temPagamento = !!cfg.temPagamento
const tocaSensivel = !!cfg.tocaSensivel
const temMarca = !!cfg.temMarca
const autorizadoDeploy = !!cfg.autorizadoDeploy
const MAX_LOOPS = Number.isInteger(cfg.maxLoops) ? cfg.maxLoops : 3
const MAX_DEVOLUCOES = Number.isInteger(cfg.maxDevolucoes) ? cfg.maxDevolucoes : 2

const querWeb = plataforma === 'web' || plataforma === 'ambos'
const querMobile = plataforma === 'mobile' || plataforma === 'ambos'
const temUI = querWeb || querMobile

// Os 4 gates humanos (Princípio 6): o workflow nunca os cruza sozinho.
const GATES_HUMANOS = ['mudança de escopo', 'custo / serviço pago', 'deploy em produção (exceto se pré-autorizado via args)', 'operação destrutiva em dados']

// Guarda de orçamento de tokens: loops param com folga em vez de morrer no meio.
const orcamentoOk = (folga) => !budget.total || budget.remaining() > (folga || 40000)

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
const HANDOFF = {
  type: 'object', additionalProperties: false,
  required: ['skill', 'estado', 'resumo', 'artefatos', 'decisoes', 'pendencias', 'ferramentas_operadas'],
  properties: {
    skill: { type: 'string' },
    estado: { type: 'string', enum: ['pronto', 'bloqueado'] },
    resumo: { type: 'string', description: '2-4 linhas do que foi feito e o que a próxima fase precisa saber' },
    artefatos: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['nome', 'caminho', 'estado'],
      properties: { nome: { type: 'string' }, caminho: { type: 'string' }, estado: { type: 'string' } } } },
    decisoes: { type: 'array', items: { type: 'string' } },
    pendencias: { type: 'array', items: { type: 'string' } },
    ferramentas_operadas: { type: 'array', items: { type: 'string' } },
  },
}

const GATE = {
  type: 'object', additionalProperties: false,
  required: ['aprovado', 'faltas', 'resumo'],
  properties: {
    aprovado: { type: 'boolean' },
    faltas: { type: 'array', items: { type: 'string' }, description: 'lista objetiva e numerável do que impede o avanço (vazia se aprovado)' },
    resumo: { type: 'string' },
  },
}

const VEREDITO = {
  type: 'object', additionalProperties: false,
  required: ['resultado', 'bugs', 'resumo'],
  properties: {
    resultado: { type: 'string', enum: ['APROVADA', 'REPROVADA'] },
    resumo: { type: 'string' },
    bugs: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['titulo', 'dimensao', 'severidade', 'reproducao'],
      properties: {
        titulo: { type: 'string' },
        dimensao: { type: 'string', enum: ['funcional', 'performance', 'logs', 'visual', 'llm', 'seguranca'] },
        severidade: { type: 'string', enum: ['S1', 'S2', 'S3', 'S4'] },
        reproducao: { type: 'string' },
        evidencia: { type: 'string' },
        arquivo: { type: 'string' },
      } } },
  },
}

const PLANO_EXEC = {
  type: 'object', additionalProperties: false,
  required: ['resumo', 'conflitos', 'fatias'],
  properties: {
    resumo: { type: 'string' },
    conflitos: { type: 'array', items: { type: 'string' }, description: 'conflitos contrato↔design encontrados no fan-in, com o dono sugerido da decisão' },
    fatias: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['nome', 'dono', 'ownership', 'descricao'],
      properties: {
        nome: { type: 'string' },
        dono: { type: 'string', enum: ['/dev-senior', '/engenheiro-senior-produto', '/engenheiro-ia'] },
        ownership: { type: 'string', description: 'arquivos/pastas EXCLUSIVOS desta fatia (fronteira de escrita)' },
        descricao: { type: 'string' },
      } } },
  },
}

const MODO_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['modo', 'justificativa'],
  properties: {
    modo: { type: 'string', enum: ['projeto-do-zero', 'feature-nova', 'bugfix', 'redesign', 'auditoria', 'resgate-de-projeto'] },
    justificativa: { type: 'string' },
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const CONTRATO = `Você faz parte de uma equipe orquestrada pelo workflow /equipe. Nomes canônicos com barra são fixos.
Regras invioláveis (Princípio 6): NÃO crie serviço pago, NÃO rode operação destrutiva em dados (drop/delete em massa/migration irreversível em prod)${autorizadoDeploy ? '' : ', NÃO faça deploy em produção'}. Se o trabalho exigir uma dessas, PARE e devolva como pendência bloqueante — quem autoriza é o humano. Data do ciclo para registros: ${dataCiclo}.`

function comoSkill(skill, missao, insumos, ferramentas, gate) {
  return `Atue como a skill ${skill}. Carregue e siga a skill integralmente.
${CONTRATO}

## Antes de trabalhar
1. Leia o estado do projeto: ${EQUIPE} (pode estar em esqueleto — o estado consolidado é gravado no fim do run; use os insumos abaixo como verdade).
2. Insumos de entrada: ${insumos}

## Contexto do projeto
- Brief: ${brief}
- Público: ${publico}
- Plataforma: ${plataforma}
- Restrições: ${restricoes}
- IA/LLM no produto: ${temLLM ? 'sim' : 'não'} · Pagamento/Stripe: ${temPagamento ? 'sim' : 'não'}

## Sua missão
${missao}

${ferramentas ? `## Ferramentas de frontend a operar neste turno
${ferramentas}
Lembre: a ferramenta é insumo seu; a marca e os tokens finais são SUA decisão. A saída do /ui-ux-pro-max é semente — reconverta para OKLCH/tokens.ts e reverifique contraste AA par a par. O /impeccable é web-cêntrico: no mobile, filtre pela realidade RN/Expo (Reanimated, expo-router, safe areas).
` : ''}## Fronteiras
- NÃO edite o ${EQUIPE} nesta rodada (o condutor consolida o estado no fim). Devolva seu handoff estruturado.
- Respeite decisões já registradas; conflito entre o pedido e uma decisão → sinalize como pendência, não resolva por conta.

## O que você devolve (saída estruturada obrigatória)
Handoff: skill, estado (pronto|bloqueado), resumo, artefatos (nome+caminho+estado), decisões tomadas, pendências/riscos, ferramentas operadas.
Sua entrega vai enfrentar este gate: ${gate}`
}

// Caminhos dos artefatos de um conjunto de handoffs, para injetar como insumo na fase seguinte.
function caminhos(handoffs) {
  const lista = []
  for (const h of [].concat(handoffs).filter(Boolean)) {
    for (const a of (h.artefatos || [])) lista.push(`${a.nome}: ${a.caminho}`)
  }
  return lista.length ? lista.join('; ') : '(sem artefatos registrados — use os caminhos convencionais do repo)'
}

function gateComoHandoff(skill, g, ferramentas) {
  return {
    skill, estado: g && g.aprovado ? 'pronto' : 'bloqueado',
    resumo: (g && g.resumo) || `gate de ${skill}`,
    artefatos: [], decisoes: [], pendencias: (g && g.faltas) || [], ferramentas_operadas: ferramentas || [],
  }
}

// GATE COM DEVOLUÇÃO (Playbook 3): despacha o especialista, valida o gate com um
// verificador independente barato, e devolve com a lista objetiva de faltas até
// MAX_DEVOLUCOES vezes. Na última falha, registra que o problema é estrutural.
async function despacharComGate(fase, gateNome, criterios, build) {
  let h = await build(null).catch(() => null)
  let devolucoes = 0
  let ultimoGate = null
  while (h) {
    ultimoGate = await agent(
      `Você é o condutor /equipe validando o GATE "${gateNome}" (Playbook 3 da skill /equipe). ${CONTRATO}
Critérios do gate: ${criterios}
Handoff devolvido pelo especialista (JSON): ${JSON.stringify(h, null, 0)}
Abra POR AMOSTRAGEM os artefatos citados (caminhos no handoff) para confirmar que existem e cumprem o critério — não confie só na autodeclaração. Julgue friamente: aprovado true/false; se false, faltas numeradas e OBJETIVAS (o especialista corrige exatamente aquilo).`,
      { label: `gate:${gateNome}${devolucoes ? ':v' + (devolucoes + 1) : ''}`, phase: fase, schema: GATE, effort: 'low' }
    ).catch(() => null)

    if (!ultimoGate || ultimoGate.aprovado) return { handoff: h, gateOk: true, devolucoes, gate: ultimoGate }
    if (devolucoes >= MAX_DEVOLUCOES || !orcamentoOk()) {
      log(`Gate "${gateNome}": ${devolucoes} devolução(ões) sem convergir — problema estrutural (despacho/decisão). Registrado como bloqueio.`)
      return { handoff: h, gateOk: false, devolucoes, gate: ultimoGate }
    }
    devolucoes++
    log(`Gate "${gateNome}": devolvido (${devolucoes}/${MAX_DEVOLUCOES}) — ${ultimoGate.faltas.length} falta(s).`)
    h = await build(ultimoGate.faltas).catch(() => null)
  }
  return { handoff: null, gateOk: false, devolucoes, gate: ultimoGate }
}

function blocoDevolucao(faltas) {
  return faltas && faltas.length
    ? `\n\n## ⚠️ DEVOLUÇÃO DO GATE — sua entrega anterior foi devolvida. Corrija EXATAMENTE estes itens (e re-entregue completo):\n${faltas.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    : ''
}

// MARCO 1 — esqueleto do EQUIPE.md no kickoff (barato).
function criarCanvas(modoAtual) {
  return agent(
    `Atue como o condutor /equipe. ${CONTRATO}
Crie (se não existir) ou abra ${EQUIPE} usando o Template 1 da skill /equipe (Project Canvas). Se JÁ EXISTIR com conteúdo, é RETOMADA: preserve o histórico, abra um ciclo novo. Preencha visão/objetivo, modo=${modoAtual}, plataforma=${plataforma}, e decisões do kickoff (data ${dataCiclo}): brief="${brief}", público="${publico}", restrições="${restricoes}", LLM=${temLLM}, pagamento=${temPagamento}, deploy pré-autorizado=${autorizadoDeploy}. Registre como pendências as decisões que só o humano toma: ${GATES_HUMANOS.join('; ')}. Devolva um handoff curto confirmando (indique se foi criação ou retomada).`,
    { label: 'canvas:criar', phase: 'Kickoff + EQUIPE.md', schema: HANDOFF, effort: 'low' }
  ).catch(() => null)
}

// MARCO 2 — consolida TODOS os handoffs no EQUIPE.md (única barreira de bookkeeping do run).
function scribeFinal(registro) {
  return agent(
    `Atue como o condutor /equipe (mantenedor do EQUIPE.md). ${CONTRATO}
Abra ${EQUIPE} e CONSOLIDE o estado final do ciclo a partir dos handoffs abaixo (ordem = ordem dos estágios; data ${dataCiclo}). Preencha: artefatos produzidos (nome+caminho+estado), decisões (imutáveis, com data — reversão é entrada nova), pendências/riscos com dono, a seção do loop de qualidade (gate de craft, segurança, canvas do tester, veredito do QA), e o histórico de handoffs append-only (uma linha por handoff). NÃO copie conteúdo de artefato para dentro do canvas (aponte o caminho). Mantenha < ~200 linhas.
Handoffs do ciclo (JSON, em ordem): ${JSON.stringify(registro, null, 0)}
Devolva um handoff curto confirmando o que gravou e o estágio final.`,
    { label: 'canvas:consolidar', phase: 'Pré-deploy', schema: HANDOFF }
  ).catch(() => null)
}

// Roteamento de bug do loop de qualidade → dono + ferramenta (Playbook 5).
function donoDoBug(b) {
  switch (b.dimensao) {
    case 'visual': {
      const designer = querMobile && !querWeb ? '/designer-saas-senior' : '/designer-sites-senior'
      return { skill: designer, ferramentas: '/impeccable bolder|quieter|typeset|layout|animate|clarify conforme o defeito' }
    }
    case 'llm': return { skill: '/engenheiro-ia', ferramentas: '' }
    case 'seguranca': return { skill: '/dev-senior', ferramentas: '' } // re-verificado pelo /engenheiro-seguranca em seguida
    default: return { skill: '/engenheiro-senior-produto', ferramentas: '/impeccable craft|animate|polish quando houver UI' }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLASSIFICAÇÃO DO MODO (auto ou explícito)
// ─────────────────────────────────────────────────────────────────────────────
let modo = cfg.modo || 'projeto-do-zero'
if (modo === 'auto') {
  phase('Classificar modo')
  const cls = await agent(
    `Você é o condutor /equipe classificando o MODO DE OPERAÇÃO (Playbook 2 da skill /equipe). ${CONTRATO}
Brief: "${brief}". Bug relatado: "${cfg.bug || '—'}". O repo em ${ROOT} ${temMarca ? 'JÁ tem' : 'não tem'} design system.
Olhe o terreno se precisar (existe código? EQUIPE.md? testes?) e classifique em UM dos modos: projeto-do-zero (nada existe), feature-nova (produto existe, capacidade nova), bugfix (comportamento errado em algo que existia), redesign (funciona mas precisa ficar premium), auditoria (raio-X sem construir), resgate-de-projeto (travado/herdado/abandonado). Na dúvida entre dois, escolha o MAIS completo.`,
    { label: 'modo:classificar', phase: 'Classificar modo', schema: MODO_SCHEMA, effort: 'low' }
  ).catch(() => null)
  modo = (cls && cls.modo) || 'projeto-do-zero'
  log(`Modo classificado: ${modo}${cls ? ' — ' + cls.justificativa : ''}`)
}

// Segurança sempre no projeto-do-zero; na feature só se toca superfície sensível.
const rodarSeguranca = modo === 'projeto-do-zero' || tocaSensivel || temPagamento || temLLM

// ═════════════════════════════════════════════════════════════════════════════
// MODO 3 — BUGFIX (caminho curto: dev → tester re-roda TUDO → QA)
// ═════════════════════════════════════════════════════════════════════════════
if (modo === 'bugfix') {
  phase('Kickoff + EQUIPE.md')
  await criarCanvas(modo)

  phase('Implementação')
  const fixR = await despacharComGate('Implementação', 'bugfix→tester',
    'código provado rodando; causa-raiz identificada (não sintoma); teste de regressão permanente escrito; relatório de entrega com prova',
    faltas => agent(
      comoSkill('/dev-senior',
        `Reproduza o bug, ache a CAUSA-RAIZ (Playbook 9 de debugging), aplique o fix mínimo e escreva um teste de regressão permanente. Se a causa-raiz revelar problema de arquitetura ou requisito mal definido, PARE e sinalize como pendência (escala para /arquiteto-senior ou /product-manager). Bug: ${cfg.bug || brief}${blocoDevolucao(faltas)}`,
        'código existente do repo + descrição do bug', '',
        'código provado rodando + teste de regressão + relatório de entrega (Playbook 3)'),
      { label: 'dev:bugfix', phase: 'Implementação', schema: HANDOFF }))

  const q = await rodarLoopQualidade('a suíte INTEIRA (não só o teste do bug — regressão nasce no conserto)', [fixR.handoff])
  phase('Pré-deploy')
  const plano = await planoDeDeploy()
  const deployExec = await talvezExecutarDeploy(q, plano)
  await scribeFinal([fixR.handoff, ...q.registro, plano, deployExec].filter(Boolean))
  return {
    modo, fix: fixR.handoff, gates: [{ nome: 'bugfix→tester', ok: fixR.gateOk, devolucoes: fixR.devolucoes }],
    qualidade: resumoQualidade(q), planoDeDeploy: plano, deployExecutado: deployExec,
    precisaAutorizacaoHumana: GATES_HUMANOS, kickoff: ecoKickoff(),
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODO 5 — AUDITORIA (fan-out só-leitura → diagnóstico consolidado; não constrói)
// ═════════════════════════════════════════════════════════════════════════════
if (modo === 'auditoria') {
  phase('Kickoff + EQUIPE.md')
  await criarCanvas(modo)

  phase('Auditoria / Resgate')
  const thunks = [
    () => agent(comoSkill('/engenheiro-seguranca',
      'AUDITORIA (só leitura + PoC inofensivo): RLS por role, auth server-side, IDOR/BOLA, webhooks, segredos, supply-chain' + (temLLM ? ', OWASP LLM Top 10' : '') + '. Relatório com severidade CVSS por achado e correção recomendada na raiz. NÃO corrija nada nesta rodada.',
      'o código/infra existente no repo', '', 'relatório com achados por severidade + roteamento sugerido'),
      { label: 'audit:seguranca', phase: 'Auditoria / Resgate', schema: HANDOFF }),
    () => agent(comoSkill('/qa-senior',
      'AUDITORIA DE QUALIDADE: o que funciona de verdade vs o que finge funcionar; cobertura e saúde dos testes; gaps de critérios de aceite; matriz de risco impacto×probabilidade; estratégia de teste recomendada.',
      'o código + testes existentes', '', 'diagnóstico de qualidade com matriz de risco e recomendações priorizadas'),
      { label: 'audit:qa', phase: 'Auditoria / Resgate', schema: HANDOFF }),
    () => agent(comoSkill('/tester',
      'MEDIÇÃO DO ESTADO ATUAL: rode o que existe (build, testes, lint, tsc) e meça as 4 dimensões (logs, visual, performance, jornada) no estado presente. Emita um TEST CANVAS do status quo com evidência.',
      'o repo como está', '', 'canvas do estado atual com as 4 dimensões medidas'),
      { label: 'audit:tester', phase: 'Auditoria / Resgate', schema: HANDOFF }),
  ]
  if (temUI) {
    thunks.push(() => agent(comoSkill(querMobile && !querWeb ? '/designer-saas-senior' : '/designer-sites-senior',
      'AUDITORIA DE CRAFT/UI: rode /impeccable audit + /impeccable critique sobre a superfície atual. Hierarquia, contraste AA, responsivo, a11y, anti-slop, estados faltantes. Lista cirúrgica: onde está / o que deveria / gravidade.',
      'a UI existente no repo', '/impeccable audit + critique (obrigatório)', 'relatório de craft com achados por gravidade'),
      { label: 'audit:craft', phase: 'Auditoria / Resgate', schema: HANDOFF }))
  }
  const auditorias = (await parallel(thunks)).filter(Boolean)

  const diagnostico = await agent(
    `Atue como o condutor /equipe consolidando o MODO 5 — AUDITORIA (fan-in). ${CONTRATO}
Consolide os ${auditorias.length} relatórios abaixo num DIAGNÓSTICO ÚNICO priorizado por severidade: os 5-10 problemas mais graves primeiro, cada um com evidência, dono sugerido e modo de correção (bugfix ou feature). Termine com a ordem de ataque recomendada.
Relatórios (JSON): ${JSON.stringify(auditorias, null, 0)}`,
    { label: 'audit:diagnostico', phase: 'Auditoria / Resgate', schema: HANDOFF, effort: 'high' }).catch(() => null)

  await scribeFinal([...auditorias, diagnostico].filter(Boolean))
  return {
    modo, auditorias, diagnostico,
    proximoPasso: 'Usuário decide o que corrigir → vira ciclos de bugfix (MODO 3) ou feature-nova (MODO 2).',
    precisaAutorizacaoHumana: GATES_HUMANOS, kickoff: ecoKickoff(),
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MODO 6 — RESGATE-DE-PROJETO (avaliação paralela → plano de resgate; execução é decisão humana)
// ═════════════════════════════════════════════════════════════════════════════
if (modo === 'resgate-de-projeto') {
  phase('Kickoff + EQUIPE.md')
  await criarCanvas(modo)

  phase('Auditoria / Resgate')
  const thunks = [
    () => agent(comoSkill('/arquiteto-senior',
      'AVALIAÇÃO DE RESGATE: o que existe (stack, dívida técnica, padrões), o que aproveitar vs reescrever — responda "o que custa menos: consertar ou refazer?" com EVIDÊNCIA (não com gosto). O instinto de reescrever tudo é a armadilha.',
      'o repo herdado/travado como está', '', 'avaliação com evidência: aproveitar/refazer/matar por área'),
      { label: 'resgate:arquiteto', phase: 'Auditoria / Resgate', schema: HANDOFF }),
    () => agent(comoSkill('/qa-senior',
      'AUDITORIA DO ESTADO REAL: o que funciona de verdade, o que finge funcionar, o que está quebrado silenciosamente. Rode/valide o que der. Sem otimismo: fatos.',
      'o repo como está', '', 'mapa fato-a-fato do que funciona/finge/quebrou'),
      { label: 'resgate:qa', phase: 'Auditoria / Resgate', schema: HANDOFF }),
  ]
  if (temUI) {
    thunks.push(() => agent(comoSkill(querMobile && !querWeb ? '/designer-saas-senior' : '/designer-sites-senior',
      'ESTADO DA UI: dá para salvar ou refazer? Rode /impeccable audit no que existe e responda com evidência.',
      'a UI existente', '/impeccable audit', 'veredito salvar/refazer por superfície, com evidência'),
      { label: 'resgate:design', phase: 'Auditoria / Resgate', schema: HANDOFF }))
  }
  const avaliacoes = (await parallel(thunks)).filter(Boolean)

  const planoResgate = await agent(
    `Atue como o condutor /equipe consolidando o MODO 6 — RESGATE (fan-in). ${CONTRATO}
Consolide as avaliações num PLANO DE RESGATE: (1) aproveitar / refazer / matar, por área, com evidência; (2) ordem de ataque; (3) esforço estimado por etapa; (4) riscos. O plano é DECISÃO DE ESCOPO do usuário (Princípio 6) — deixe isso explícito no topo. Salve em docs/PLANO-RESGATE.md.
Avaliações (JSON): ${JSON.stringify(avaliacoes, null, 0)}`,
    { label: 'resgate:plano', phase: 'Auditoria / Resgate', schema: HANDOFF, effort: 'high' }).catch(() => null)

  await scribeFinal([...avaliacoes, planoResgate].filter(Boolean))
  return {
    modo, avaliacoes, planoDeResgate: planoResgate,
    proximoPasso: 'GATE HUMANO (escopo): usuário aprova o plano → execução como projeto-do-zero ou feature-nova conforme o plano.',
    precisaAutorizacaoHumana: GATES_HUMANOS, kickoff: ecoKickoff(),
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// CAMINHO COMPLETO — MODO 1 (projeto-do-zero), MODO 2 (feature-nova), MODO 4 (redesign)
// ═════════════════════════════════════════════════════════════════════════════
const registro = []
const resumoGates = []

// Estágio 0-2: kickoff + EQUIPE.md (esqueleto)
phase('Kickoff + EQUIPE.md')
await criarCanvas(modo)

// Estágio 3: Discovery (PRD) — pulado no redesign (Playbook 2)
let prdR = null
if (modo !== 'redesign') {
  phase('Discovery (PRD)')
  const missaoPRD = modo === 'feature-nova'
    ? 'Produza o MINI-PRD da feature: problema, escopo e fora-de-escopo, critérios de aceite testáveis (dado/quando/então), estados de UI obrigatórios, métrica de sucesso. Salve em docs/prd/.'
    : 'Transforme o brief em PRD customer-backwards versionado com critérios de aceite testáveis (dado/quando/então), escopo e fora-de-escopo, todos os estados de UI (vazio/loading/erro/offline/sem permissão) e métricas de sucesso. Salve em docs/prd/.'
  prdR = await despacharComGate('Discovery (PRD)', 'PRD→arquitetura/designers',
    'problema e público definidos; escopo COM o que não entra; critérios de aceite testáveis por feature (dado/quando/então — "deve ser rápido" conta como ausente); estados de UI mapeados; métricas de sucesso',
    faltas => agent(
      comoSkill('/product-manager', missaoPRD + blocoDevolucao(faltas),
        'o brief e o contexto do kickoff acima', '',
        'PRD com critérios de aceite testáveis; /arquiteto-senior arquiteta sem reunião de desambiguação (Playbook 3)'),
      { label: 'pm:prd', phase: 'Discovery (PRD)', schema: HANDOFF }))
  if (prdR.handoff) registro.push(prdR.handoff)
  resumoGates.push({ nome: 'PRD', ok: prdR.gateOk, devolucoes: prdR.devolucoes })
  log(`PRD ${prdR.gateOk ? 'aprovado no gate ✅' : 'com bloqueio ⚠️'} (${prdR.devolucoes} devolução(ões)).`)
}
const refPRD = prdR ? caminhos(prdR.handoff) : '(redesign — sem PRD novo; a referência é o produto atual)'

// Estágio 4: Design + Arquitetura — FAN-OUT com gate por thread
phase('Design + Arquitetura')
const semente = temMarca
  ? 'NÃO gere design system novo — herde a marca/tokens existentes.'
  : '/ui-ux-pro-max: gere a semente do design system (paleta, tipografia, estilo, regras UX) — persista em design-system/MASTER.md. Reconverta para OKLCH/tokens e verifique AA par a par.'
const ferramentasDesigner = `${semente}
/impeccable: shape (enquadrar IA/UX) e craft/extract (tokens); critique+audit ANTES do handoff para preencher o checklist de craft; typeset/layout/animate para calibrar.`

// /arquiteto-senior entra: sempre no projeto-do-zero; na feature-nova o próprio agente decide se a
// feature muda schema/contrato (condicional do Playbook 2, registrada como decisão); nunca no redesign.
const designThunks = []
if (modo !== 'redesign') {
  designThunks.push(() => despacharComGate('Design + Arquitetura', 'arquitetura→implementação',
    'stack justificada; modelo de dados completo (tabelas, constraints, índices, RLS org_id); contratos de API tipados (entrada/saída/erros — "a definir na implementação" é ausência); estados por tela; ADRs por one-way door; estratégia de auth',
    faltas => agent(
      comoSkill('/arquiteto-senior',
        (modo === 'feature-nova'
          ? 'Avalie PRIMEIRO se esta feature muda modelo de dados, contrato de API ou introduz serviço novo. Se NÃO muda, devolva a decisão registrada ("arquitetura existente cobre a feature — pulado") com os contratos existentes apontados. Se muda, produza o delta de arquitetura: '
          : 'Produza arquitetura executável: ')
        + 'stack justificada, modelo de dados PostgreSQL com RLS org_id, contratos de API tipados, estados por tela no contrato de integração, ADRs por one-way door. Salve em docs/architecture/.' + blocoDevolucao(faltas),
        `o PRD (${refPRD})`, '',
        'arquitetura executável; /dev-senior implementa sem reunião de esclarecimento (Playbook 3)'),
      { label: 'arq:arquitetura', phase: 'Design + Arquitetura', schema: HANDOFF })))
}
if (querWeb) {
  designThunks.push(() => despacharComGate('Design + Arquitetura', 'design-web→implementação',
    'tokens completos sem placeholder; contraste AA verificado par a par (light+dark); specs por seção com TODOS os estados (loading/erro/vazio/sucesso); responsivo por breakpoint; dark mode; a11y; checklist de craft do /impeccable preenchido',
    faltas => agent(
      comoSkill('/designer-sites-senior',
        (modo === 'redesign'
          ? 'REDESIGN: audite o design atual (com /impeccable audit/critique) e produza o novo design premium — direção de arte, tokens OKLCH light+dark, specs por seção com TODOS os estados, checklist de craft. Zero regressão funcional é lei.'
          : 'Produza direção de arte + tokens OKLCH (light+dark) + specs por seção com TODOS os estados (loading/erro/vazio/sucesso) + checklist de craft. Sem placeholder, pronto para implementar.') + blocoDevolucao(faltas),
        `o PRD (${refPRD}) + o contrato de integração do /arquiteto-senior (estados por tela)`, ferramentasDesigner,
        'tokens completos, AA verificado, todos os estados, checklist de craft preenchido (Playbook 3)'),
      { label: 'design:web', phase: 'Design + Arquitetura', schema: HANDOFF })))
}
if (querMobile) {
  designThunks.push(() => despacharComGate('Design + Arquitetura', 'design-mobile→implementação',
    'tokens.ts com AA par a par nos dois temas; árvore expo-router (modais no stack raiz, deep links); specs de tela com os 4+1 estados (loading/vazio/erro/conteúdo/offline); teclado; safe areas; touch >=44/48; a11y; checklist de handoff',
    faltas => agent(
      comoSkill('/designer-saas-senior',
        (modo === 'redesign'
          ? 'REDESIGN mobile: audite o app atual e produza o novo design — tokens.ts, navegação, specs com os 4+1 estados, checklist. Zero regressão funcional é lei.'
          : 'Produza tokens.ts (light+dark, base 4, motion, touch) + mapa de navegação expo-router + specs de tela com os 4+1 estados + checklist de handoff. Guardião da marca e do feeling nativo.') + blocoDevolucao(faltas),
        `o PRD (${refPRD}) + o contrato de integração do /arquiteto-senior`, ferramentasDesigner,
        'tokens.ts com AA, árvore expo-router, todos os estados, touch >=44/48, a11y (Playbook 3)'),
      { label: 'design:mobile', phase: 'Design + Arquitetura', schema: HANDOFF })))
}
const designRounds = (await parallel(designThunks)).filter(Boolean)
const designArq = designRounds.map(r => r.handoff).filter(Boolean)
registro.push(...designArq)
for (const r of designRounds) resumoGates.push({ nome: 'design/arq', ok: r.gateOk, devolucoes: r.devolucoes })
log(`Design + arquitetura: ${designArq.length} entrega(s), ${designRounds.filter(r => !r.gateOk).length} bloqueio(s).`)

// FAN-IN + PLANO DE EXECUÇÃO: reconcilia conflitos contrato↔design E fatia o trabalho
// com ownership DISJUNTO de arquivos (Playbook 4) — uma barreira genuína, effort alto.
const plano = await agent(
  `Atue como o condutor /equipe fazendo o FAN-IN do estágio de design+arquitetura E o PLANO DE EXECUÇÃO. ${CONTRATO}
1. CACE CONFLITOS entre o contrato de API do /arquiteto-senior e as specs dos designers (ex.: design mostra edição inline mas o contrato só tem update completo; tela exige realtime mas a arquitetura é REST). Liste cada conflito com o dono sugerido da decisão.
2. FATIE a implementação em fatias verticais com OWNERSHIP DISJUNTO de arquivos/pastas (dois donos nunca escrevem no mesmo arquivo): /dev-senior = espinha dorsal full-stack (migrations, RLS, API, telas core); /engenheiro-senior-produto = features de polish${temPagamento ? ' + fluxos Stripe' : ''}${temLLM ? '; /engenheiro-ia = camada de IA (prompts, RAG, evals, guardrails)' : ''}. 2-5 fatias no total.
Handoffs de design+arquitetura (JSON): ${JSON.stringify(designArq, null, 0)}`,
  { label: 'fan-in:plano-exec', phase: 'Design + Arquitetura', schema: PLANO_EXEC, effort: 'high' }).catch(() => null)
if (plano) {
  registro.push({ skill: '/equipe', estado: 'pronto', resumo: `Fan-in: ${plano.conflitos.length} conflito(s); plano de execução com ${plano.fatias.length} fatia(s). ${plano.resumo}`,
    artefatos: [], decisoes: plano.conflitos.map(c => `Conflito a decidir: ${c}`), pendencias: [], ferramentas_operadas: [] })
  if (plano.conflitos.length) log(`Fan-in: ${plano.conflitos.length} conflito(s) contrato↔design detectado(s) — registrados para decisão.`)
}

// Estágio 5: Implementação — FAN-OUT por dono, com ownership explícito do plano e gate por thread
phase('Implementação')
const refDesign = caminhos(designArq)
const fatiasPorDono = {}
for (const f of ((plano && plano.fatias) || [])) {
  fatiasPorDono[f.dono] = fatiasPorDono[f.dono] || []
  fatiasPorDono[f.dono].push(f)
}
// Fallback: sem plano, divisão padrão da esteira.
if (!Object.keys(fatiasPorDono).length) {
  fatiasPorDono['/dev-senior'] = [{ nome: 'espinha-dorsal', dono: '/dev-senior', ownership: 'backend + telas core (defina e declare no handoff)', descricao: 'espinha dorsal full-stack' }]
  fatiasPorDono['/engenheiro-senior-produto'] = [{ nome: 'polish', dono: '/engenheiro-senior-produto', ownership: 'features de polish' + (temPagamento ? ' + Stripe' : ''), descricao: 'features polidas ponta-a-ponta' }]
  if (temLLM) fatiasPorDono['/engenheiro-ia'] = [{ nome: 'ia', dono: '/engenheiro-ia', ownership: 'prompts/, evals/, camada LLM', descricao: 'camada de IA' }]
}
if (temLLM && !fatiasPorDono['/engenheiro-ia']) {
  fatiasPorDono['/engenheiro-ia'] = [{ nome: 'ia', dono: '/engenheiro-ia', ownership: 'prompts/, evals/, camada LLM', descricao: 'camada de IA' }]
}

const missaoImpl = {
  '/dev-senior': 'Implemente suas fatias em fatias verticais completas: migration+RLS → tipos → Zod → API/action → hook → UI com todos os estados → teste. Prove rodando (dado no banco, estados forçados, RLS por role, tsc/lint/testes verdes).',
  '/engenheiro-senior-produto': (modo === 'redesign'
    ? 'Implemente o novo design com FIDELIDADE TOTAL à spec (você é a ponte design↔código). Zero regressão funcional.'
    : 'Implemente suas fatias ponta-a-ponta com polish (dado→API→UI→estados→micro-interações→instrumentação)' + (temPagamento ? ', incluindo Stripe (checkout, webhook com assinatura+idempotência, provisioning pelo webhook nunca por redirect)' : '') + '. Fidelidade total à spec.'),
  '/engenheiro-ia': 'Construa a camada de IA: prompts versionados, pipeline (RAG/workflow/agente), saída validada por Zod, guardrails, golden set + evals em CI com gate bloqueante, tracing de custo/latência.',
}
const ferrImpl = {
  '/dev-senior': '/impeccable clarify (ambiguidade de spec), craft (UI fiel), animate (motion)',
  '/engenheiro-senior-produto': '/impeccable craft (empty states), animate (micro-interações), polish (papercuts)',
  '/engenheiro-ia': '',
}
const gateImpl = {
  '/dev-senior': 'código provado rodando + relatório de entrega com prova (fluxo executado, dado no banco, estados forçados, RLS testada); sem any/@ts-ignore novos; suíte verde',
  '/engenheiro-senior-produto': 'COMPLETO (CRUD+validação+auth+4 estados) + POLIDO (fidelidade à spec, transições, skeletons) + ACESSÍVEL + INSTRUMENTADO' + (temPagamento ? ' + webhook Stripe com assinatura+idempotência' : ''),
  '/engenheiro-ia': 'golden set >=30 casos, evals verdes >= limiares, saída Zod em toda fronteira, OWASP LLM revisado',
}

const implRounds = (await parallel(Object.keys(fatiasPorDono).map(dono => () =>
  despacharComGate('Implementação', `implementação:${dono}`, gateImpl[dono],
    faltas => agent(
      comoSkill(dono,
        `${missaoImpl[dono]}
SUAS FATIAS (ownership EXCLUSIVO — não escreva fora destas fronteiras; conflito de fronteira é pendência, não improviso):
${fatiasPorDono[dono].map(f => `- ${f.nome}: ${f.descricao} — ownership: ${f.ownership}`).join('\n')}${blocoDevolucao(faltas)}`,
        `PRD (${refPRD}) + arquitetura/contratos + specs de design (${refDesign})`, ferrImpl[dono],
        gateImpl[dono] + ' (Playbook 3)'),
      { label: `impl:${dono.replace('/', '')}`, phase: 'Implementação', schema: HANDOFF }))
))).filter(Boolean)
const impl = implRounds.map(r => r.handoff).filter(Boolean)
registro.push(...impl)
for (const r of implRounds) resumoGates.push({ nome: 'implementação', ok: r.gateOk, devolucoes: r.devolucoes })
log(`Implementação: ${impl.length} dono(s) entregaram; ${implRounds.filter(r => !r.gateOk).length} bloqueio(s).`)

// Estágio 6: GATE DE CRAFT (antes da segurança) — por plataforma, com loop de correção
let craftResultados = []
if (temUI) {
  phase('Gate de craft')
  const alvos = []
  if (querWeb) alvos.push({ plat: 'web', auditor: '/engenheiro-senior-produto', corretor: '/designer-sites-senior' })
  if (querMobile) alvos.push({ plat: 'mobile', auditor: '/designer-saas-senior', corretor: '/designer-saas-senior' })

  craftResultados = (await parallel(alvos.map(a => async () => {
    const auditar = (rodada) => agent(
      comoSkill(a.auditor,
        `GATE DE CRAFT (${a.plat}${rodada ? `, re-auditoria ${rodada}` : ''}): rode /impeccable audit + /impeccable critique sobre a UI REAL implementada${a.plat === 'mobile' ? ' (filtre pela realidade RN/Expo; audite o build real: teclado, dark, Dynamic Type, VoiceOver/TalkBack, modo avião)' : ''}. Avalie hierarquia visual, contraste AA, responsivo, a11y, anti-slop e presença de todos os estados. Repare P0/P1 triviais na hora; o resto vira falta.`,
        `a UI implementada (${refDesign}) + as specs de design`, '/impeccable audit + critique (obrigatório)',
        'craft limpo: sem slop, AA ok, todos os estados, P0/P1 zerados'),
      { label: `craft:${a.plat}${rodada ? ':v' + (rodada + 1) : ':audit'}`, phase: 'Gate de craft', schema: GATE })
    let g = await auditar(0).catch(() => null)
    let rodadas = 0
    while (g && !g.aprovado && rodadas < 2 && orcamentoOk()) {
      rodadas++
      log(`Gate de craft (${a.plat}): ${g.faltas.length} achado(s) P0/P1 — roteando ao ${a.corretor} (rodada ${rodadas}).`)
      await agent(
        comoSkill(a.corretor,
          `Corrija os achados do gate de craft (${a.plat}) na causa, usando /impeccable no subcomando certo (typeset/layout/animate/quieter/bolder/clarify):${blocoDevolucao(g.faltas)}`,
          'a UI implementada + os achados acima', '/impeccable conforme o defeito',
          're-auditoria de craft limpa'),
        { label: `craft:${a.plat}:fix${rodadas}`, phase: 'Gate de craft', schema: HANDOFF }).catch(() => null)
      g = await auditar(rodadas).catch(() => null)
    }
    return { plat: a.plat, gate: g, rodadas }
  }))).filter(Boolean)

  for (const c of craftResultados) {
    registro.push(gateComoHandoff(`gate-de-craft(${c.plat})`, c.gate, ['/impeccable audit', '/impeccable critique']))
    resumoGates.push({ nome: `craft:${c.plat}`, ok: !!(c.gate && c.gate.aprovado), devolucoes: c.rodadas })
  }
  log(`Gate de craft: ${craftResultados.filter(c => c.gate && c.gate.aprovado).length}/${craftResultados.length} plataforma(s) limpas.`)
}

// Estágio 7: Segurança — auditoria com loop de correção + re-verificação (ataque re-executado FALHANDO)
let sec = null
let secRodadas = 0
if (rodarSeguranca) {
  phase('Segurança')
  const auditarSeg = (rodada) => agent(
    comoSkill('/engenheiro-seguranca',
      `${rodada ? `RE-VERIFICAÇÃO ${rodada}: re-execute os ataques originais das fichas abertas — só feche o que FALHAR ao re-executar. ` : ''}Auditoria ofensiva+defensiva sobre o estado consolidado: RLS por role no banco real (anon/authenticated/admin), auth server-side, IDOR/BOLA, preço server-side${temPagamento ? ', webhook Stripe (assinatura+idempotência)' : ''}${temLLM ? ', OWASP LLM (injection/exfiltração/agência excessiva)' : ''}. Corrija crítico/alto NA RAIZ (eliminando a CLASSE) quando estiver no seu alcance; o que exige mudança de feature vira falta com ficha SEC-XXX. Emita o Security Canvas.`,
      'código + migrations + políticas RLS + integrações', '',
      'zero Crítica/Alta em aberto; RLS provada rodando como cada role; ataque re-executado falhando (Playbook 3)'),
    { label: rodada ? `seguranca:reverify${rodada}` : 'seguranca:auditoria', phase: 'Segurança', schema: GATE })

  sec = await auditarSeg(0).catch(() => null)
  while (sec && !sec.aprovado && secRodadas < 2 && orcamentoOk()) {
    secRodadas++
    log(`Segurança: ${sec.faltas.length} achado(s) crítico/alto — roteando ao /dev-senior (rodada ${secRodadas}).`)
    await agent(
      comoSkill('/dev-senior',
        `Corrija na CAUSA-RAIZ os achados de segurança abaixo (elimine a CLASSE, não só o payload; cada fix com teste de regressão):${blocoDevolucao(sec.faltas)}`,
        'as fichas SEC-XXX + o código afetado', '',
        'o /engenheiro-seguranca vai re-executar os ataques originais — eles devem FALHAR'),
      { label: `seguranca:fix${secRodadas}`, phase: 'Segurança', schema: HANDOFF }).catch(() => null)
    sec = await auditarSeg(secRodadas).catch(() => null)
  }
  registro.push(gateComoHandoff('/engenheiro-seguranca', sec, []))
  resumoGates.push({ nome: 'segurança', ok: !!(sec && sec.aprovado), devolucoes: secRodadas })
  log(`Segurança: ${sec && sec.aprovado ? 'limpa ✅' : 'com achados em aberto ⚠️'} (${secRodadas} rodada(s) de correção).`)
}

// Estágio 8: Loop de qualidade (tester → QA, até APROVADA ou diagnóstico estrutural)
const escopoTeste = modo === 'redesign'
  ? 'regressão VISUAL completa (baseline+diff, cross-viewport, cross-tema) + a suíte funcional INTEIRA (jornadas intactas — redesign que quebra fluxo é REPROVADA na hora)'
  : 'a suíte inteira nas 4 dimensões'
const qualidade = await rodarLoopQualidade(escopoTeste, impl)
registro.push(...qualidade.registro)

// Estágio 9: Pré-deploy — polish+harden (se UI) → plano → execução SÓ se pré-autorizada
phase('Pré-deploy')
let polishFinal = null
if (temUI && qualidade.veredito && qualidade.veredito.resultado === 'APROVADA') {
  polishFinal = await agent(
    comoSkill('/engenheiro-senior-produto',
      'PASSADA FINAL PRÉ-DEPLOY: rode /impeccable polish (papercuts: loading que pisca, skeleton anti-flash, micro-detalhes) e /impeccable harden (estados, edge cases, i18n, error handling voltado ao usuário) sobre a superfície aprovada. Só toques finais — mudança estrutural aqui é regressão.',
      'a superfície APROVADA pelo /qa-senior', '/impeccable polish + harden (obrigatório)',
      'zero papercut conhecido; edge cases cobertos'),
    { label: 'predeploy:polish', phase: 'Pré-deploy', schema: HANDOFF }).catch(() => null)
  if (polishFinal) registro.push(polishFinal)
}
const plano9 = await planoDeDeploy()
if (plano9) registro.push(plano9)
const deployExec = await talvezExecutarDeploy(qualidade, plano9)
if (deployExec) registro.push(deployExec)

// MARCO 2: consolida tudo no EQUIPE.md
await scribeFinal(registro)

return {
  modo, plataforma,
  prd: prdR ? prdR.handoff : null,
  designArquitetura: designArq,
  planoDeExecucao: plano,
  implementacao: impl,
  gateDeCraft: craftResultados,
  seguranca: sec ? { aprovado: sec.aprovado, faltas: sec.faltas, rodadas: secRodadas } : null,
  qualidade: resumoQualidade(qualidade),
  polishFinal,
  planoDeDeploy: plano9,
  deployExecutado: deployExec,
  gates: resumoGates,
  precisaAutorizacaoHumana: GATES_HUMANOS,
  kickoff: ecoKickoff(),
  nota: deployExec
    ? 'Deploy executado com pré-autorização explícita (args.autorizadoDeploy). Verifique observabilidade e rollback no plano.'
    : 'Workflow parou antes do deploy. Revise o plano, autorize custo/produção e então acione /engenheiro-devops (ou re-rode com autorizadoDeploy:true).',
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-ROTINAS
// ─────────────────────────────────────────────────────────────────────────────
function ecoKickoff() {
  return { brief, publico, plataforma, modo, temLLM, temPagamento, tocaSensivel, temMarca, autorizadoDeploy, dataCiclo, root: ROOT, maxLoops: MAX_LOOPS, maxDevolucoes: MAX_DEVOLUCOES }
}

function resumoQualidade(q) {
  return { veredito: q.veredito ? q.veredito.resultado : null, resumo: q.veredito ? q.veredito.resumo : null, loops: q.loops, historico: q.historico, diagnosticoEstrutural: q.diagnostico || null }
}

async function rodarLoopQualidade(escopoDoTeste, contextoImpl) {
  phase('Qualidade (tester + QA)')
  const reg = []
  const historico = []
  let veredito = null
  let diagnostico = null
  let loop = 0
  const refImpl = caminhos(contextoImpl || [])

  while (loop < MAX_LOOPS && orcamentoOk(60000)) {
    loop++
    const canvas = await agent(comoSkill('/tester',
      `${loop > 1 ? `LOOP ${loop}: RE-RODE A SUÍTE INTEIRA (o conserto pode ter parido regressão nova — nunca só o teste que falhou). ` : ''}Construa/rode a automação e meça ${escopoDoTeste} — E2E + unitário + as 4 dimensões (logs, visual, performance, jornada) + a11y (axe) — por role × viewport × tema${querMobile && querWeb ? ', cobrindo AMBAS as plataformas (jornada verde só no web não é jornada verde)' : ''}. Emita o TEST CANVAS com cada falha roteada (dimensão + evidência + destinatário).`,
      `a implementação consolidada (${refImpl}) + critérios de aceite do PRD`, '/impeccable critique/audit para amplificar o relatório de falha visual/a11y antes de rotear ao designer',
      'canvas com 4 dimensões medidas e cada falha com evidência e roteamento (Playbook 3)'),
      { label: `tester:loop${loop}`, phase: 'Qualidade (tester + QA)', schema: HANDOFF }).catch(() => null)
    if (canvas) reg.push(canvas)

    veredito = await agent(comoSkill('/qa-senior',
      'Publique o Contrato de Veredito (critérios imutáveis — a trave não se move depois que o teste começa) e JULGUE a evidência do /tester. Veredito binário: APROVADA só com 100% dos cenários verdes, ZERO S1/S2 aberto, zero achado Crítico/Alto de segurança aberto, métricas no orçamento (LCP<2.5s, INP<200ms, API p95<500ms). "Aprovado com ressalvas" NÃO existe. Liste cada bug (dimensão, severidade, reprodução, evidência).',
      'o TEST CANVAS do /tester + a auditoria de segurança + o PRD', '',
      'veredito APROVADA/REPROVADA por escrito (gate G7)'),
      { label: `qa:loop${loop}`, phase: 'Qualidade (tester + QA)', schema: VEREDITO, effort: 'high' }).catch(() => null)

    const bugs = (veredito && veredito.bugs) || []
    reg.push({ skill: '/qa-senior', estado: veredito && veredito.resultado === 'APROVADA' ? 'pronto' : 'bloqueado',
      resumo: `Loop ${loop}: ${(veredito && veredito.resultado) || '—'}. ${(veredito && veredito.resumo) || ''}`,
      artefatos: [], decisoes: [`Veredito loop ${loop} (${dataCiclo}): ${(veredito && veredito.resultado) || '—'}`],
      pendencias: bugs.map(b => `${b.severidade} ${b.dimensao}: ${b.titulo}`), ferramentas_operadas: [] })
    historico.push({ loop, resultado: veredito && veredito.resultado, bugs: bugs.length })

    if (veredito && veredito.resultado === 'APROVADA') { log(`Loop ${loop}: APROVADA ✅`); break }
    log(`Loop ${loop}: REPROVADA — ${bugs.length} bug(s), roteando aos donos.`)

    // Não-convergência (Playbook 5): o problema é estrutural — diagnostica a fase de origem.
    if (loop >= MAX_LOOPS) {
      log(`Loop não convergiu em ${MAX_LOOPS} voltas — emitindo diagnóstico estrutural.`)
      diagnostico = await agent(
        `Atue como o condutor /equipe emitindo o DIAGNÓSTICO ESTRUTURAL (Playbook 5): o loop de qualidade não convergiu em ${MAX_LOOPS} voltas — o problema NÃO é mais um ciclo de correção; é estrutural (spec furada, arquitetura errada, escopo mal cortado ou critérios de aceite ambíguos). ${CONTRATO}
Histórico dos loops: ${JSON.stringify(historico)}. Bugs remanescentes: ${JSON.stringify(bugs.map(b => ({ t: b.titulo, d: b.dimensao, s: b.severidade })))}.
Identifique a FASE DE ORIGEM mais provável (PRD / arquitetura / design / implementação), a evidência, e a recomendação objetiva de re-trabalho (o que reabrir, com qual especialista). Isso volta ao humano como decisão de escopo.`,
        { label: 'diagnostico:estrutural', phase: 'Qualidade (tester + QA)', schema: HANDOFF, effort: 'high' }).catch(() => null)
      if (diagnostico) reg.push(diagnostico)
      break
    }
    if (!orcamentoOk(60000)) { log('Orçamento de tokens no limite — encerrando o loop de qualidade com o estado atual.'); break }

    // Roteia cada bug ao dono + ferramenta, em paralelo (Playbook 5).
    const fixes = (await parallel(bugs.map((b, i) => () => {
      const { skill, ferramentas } = donoDoBug(b)
      return agent(comoSkill(skill,
        `Corrija na CAUSA-RAIZ este bug (${b.severidade}, dimensão ${b.dimensao}): "${b.titulo}". Reprodução: ${b.reproducao}.${b.arquivo ? ` Arquivo: ${b.arquivo}.` : ''} Entregue fix + teste de regressão permanente no mesmo ciclo.`,
        'o bug report + o código afetado', ferramentas,
        'causa-raiz corrigida + teste de regressão; a suíte inteira vai re-rodar'),
        { label: `fix:loop${loop}:${b.dimensao}:${i}`, phase: 'Qualidade (tester + QA)', schema: HANDOFF }).catch(() => null)
    }))).filter(Boolean)
    reg.push(...fixes)

    // Bug de segurança corrigido → /engenheiro-seguranca re-verifica ANTES do re-teste (Playbook 5).
    const bugsSeg = bugs.filter(b => b.dimensao === 'seguranca')
    if (bugsSeg.length) {
      const rev = await agent(comoSkill('/engenheiro-seguranca',
        `RE-VERIFICAÇÃO de ${bugsSeg.length} fix(es) de segurança do loop ${loop}: re-execute o ataque original de cada um — só está fechado o que FALHAR ao re-executar. Bugs: ${bugsSeg.map(b => b.titulo).join('; ')}.`,
        'os fixes aplicados + as fichas originais', '',
        'cada ataque original re-executado e falhando'),
        { label: `seguranca:reverify-loop${loop}`, phase: 'Qualidade (tester + QA)', schema: HANDOFF }).catch(() => null)
      if (rev) reg.push(rev)
    }
  }
  return { veredito, loops: loop, historico, registro: reg, diagnostico }
}

async function planoDeDeploy() {
  return agent(comoSkill('/engenheiro-devops',
    'Produza o PLANO de deploy — NÃO execute nada nesta rodada. Descreva: pipeline CI/CD com gates bloqueantes, migrations expand/contract, comando de rollback LITERAL por superfície, observabilidade (Sentry/logs/uptime/alertas com dono), backups (PITR/pg_dump + teste de restore), e custo mensal estimado dos serviços. Marque explicitamente o que exige autorização e/ou plano pago do humano. Salve em docs/runbook.md.',
    'o veredito do /qa-senior + o estado do repo (.github/workflows, eas.json, vercel.json, supabase/)', '',
    'plano reversível e observável; custo e autorizações destacados'),
    { label: 'devops:plano', phase: 'Pré-deploy', schema: HANDOFF }).catch(() => null)
}

// Deploy SÓ executa se: pré-autorizado via args + veredito APROVADA. Nunca cria serviço pago.
async function talvezExecutarDeploy(q, planoRef) {
  if (!autorizadoDeploy) return null
  if (!q || !q.veredito || q.veredito.resultado !== 'APROVADA') {
    log('Deploy pré-autorizado, mas o veredito NÃO é APROVADA — deploy NÃO executado (REPROVADA nunca avança).')
    return null
  }
  log('Deploy pré-autorizado + APROVADA: executando via /engenheiro-devops.')
  return agent(comoSkill('/engenheiro-devops',
    `EXECUTE o deploy conforme o plano (${caminhos(planoRef ? [planoRef] : [])}), com o veredito APROVADA em mãos e pré-autorização explícita do humano (args.autorizadoDeploy=true). LIMITES ABSOLUTOS: use APENAS serviços/planos JÁ existentes e pagos (não crie nem faça upgrade de nada pago); migrations só expand/contract reversíveis; rollback ensaiado ANTES; nada destrutivo em dados. Ao final: URL/ambiente, estado da observabilidade, como reverter.`,
    'o plano de deploy + o repo', '',
    'deploy executado + rollback possível + observabilidade ativa (Playbook 3)'),
    { label: 'devops:executar', phase: 'Pré-deploy', schema: HANDOFF }).catch(() => null)
}
