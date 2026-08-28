# Agentes

Repositório de **agentes de IA para desenvolvimento de software**.

Não há aplicação, build nem runtime aqui. O que está versionado são *prompts* — skills que definem o comportamento de um time de especialistas — mais os scripts auxiliares que algumas skills chamam. O time é usado em **outros** projetos (SaaS, site, app). Este repo é a fonte de verdade dos ofícios.

**Stack da casa** (quando o arquiteto não decidir outra): TypeScript, Next.js, React Native/Expo, Supabase, Vercel, Stripe. Tokens visuais em OKLCH — não shadcn/ui por padrão.

Prompts em **português**. Código, identificadores e commits em **inglês**.

---

## Início rápido

**Cursor** — os 12 especialistas, `/equipe` e `/consolidar` viram comando `/nome` via wrappers em `.cursor/skills/` (apontam para `skills/dev/`). Digite `/equipe` para conduzir um ciclo, `/dev-senior` para um especialista solto, `/consolidar` para gravar o canvas.

**Claude Code** — copie ou linke `skills/dev/<nome>.md` para `~/.claude/skills/<nome>/SKILL.md` (ou `.claude/skills/` do projeto). O pipeline executável vai para `~/.claude/workflows/equipe.js` a partir de `skills/dev/equipe.workflow.js`.

**Satélites** — já instaladas em `.agents/skills/` (pin em `skills-lock.json`). Atualizar: `npx skills update` na raiz.

---

## Modelo mental

Quatro camadas. Só a primeira segura o **bastão** de produto.

| Camada | O que é | Segura bastão? |
|---|---|---|
| **12 especialistas** | Ofício (PRD, arquitetura, design, código, segurança, teste…) | Sim |
| **`/equipe`** | Maestro: classifica modo, despacha, valida gates, guarda o `EQUIPE.md` | Conduz o ciclo; não escreve produto |
| **`/consolidar`** | Secretário do canvas, só em invocação **solta** | Não. Não despacha ninguém |
| **Comandos da casa + satélites** | Ferramentas que o especialista opera **dentro do turno** | Nunca |

Regra: o especialista decide; a ferramenta propõe. Satélite não aparece no histórico de handoff como dono. Roteamento completo: [`skills/dev/skills-satelites.md`](skills/dev/skills-satelites.md).

---

## Estrutura

```
skills/
├── dev/                          # time + maestro + secretário + catálogo
│   ├── product-manager.md
│   ├── arquiteto-senior.md
│   ├── designer-sites-senior.md
│   ├── designer-saas-senior.md
│   ├── designer-checklist-mestre.md   # lei de auditoria (não é membro)
│   ├── dev-senior.md
│   ├── engenheiro-senior-produto.md
│   ├── engenheiro-ia.md
│   ├── engenheiro-seguranca.md
│   ├── engenheiro-performance.md
│   ├── tester.md
│   ├── qa-senior.md
│   ├── engenheiro-devops.md
│   ├── equipe.md                      # orquestrador (fonte de verdade)
│   ├── equipe.workflow.js             # pipeline executável (6 modos + consolidar)
│   ├── consolidar.md
│   └── skills-satelites.md            # quem puxa qual satélite
├── impeccable/                   # craft / auditoria / polish de frontend (web)
└── framer-motion-animator/       # motion declarativo (Framer Motion)
.cursor/skills/<nome>/SKILL.md    # wrappers Cursor → skills/dev/<nome>.md
.agents/skills/<nome>/SKILL.md    # satélites (`npx skills add`)
skills-lock.json                  # pin das satélites instaladas
```

Cada skill de especialista é markdown com frontmatter (`name`, `description`) + system prompt. A `description` é o que o modelo usa para acionar a skill certa.

`/ui-ux-pro-max` é comando da casa (semente de design system) mas **não está versionado neste repo**. Vive em `~/.claude/skills/ui-ux-pro-max/` (Claude Code). No projeto de produto, o pipeline espera `skills/ui-ux-pro-max/scripts/search.py`.

---

## O time (`skills/dev/`)

### Os 12 especialistas (seguram o bastão)

| Skill | Papel |
|---|---|
| `product-manager` | Descoberta, PRD customer-backwards, priorização, o que **não** construir |
| `arquiteto-senior` | Stack, modelo de dados PostgreSQL, RLS multi-tenant, contratos de API, ADRs |
| `designer-sites-senior` | Web premium: direção de arte, tipografia, motion, WCAG 2.2, Core Web Vitals |
| `designer-saas-senior` | App mobile: React Native/Expo, Apple HIG, Material 3, navegação e estados |
| `dev-senior` | Implementação full-stack ponta a ponta — produto final, nunca MVP |
| `engenheiro-senior-produto` | Ponte design↔engenharia: features polidas, micro-interações, Stripe |
| `engenheiro-ia` | LLM em produção: prompting, RAG (pgvector), tool use, evals, guardrails |
| `engenheiro-seguranca` | Auditoria ofensiva + defensiva: OWASP, RLS, webhooks, LGPD, CVSS |
| `engenheiro-performance` | Auditoria e gate de performance: baseline, p95/p99, causa estrutural, CI |
| `tester` | SDET: Playwright, Maestro/Detox, Vitest, a11y, regressão visual, Lighthouse CI |
| `qa-senior` | Estratégia de teste por risco, Gherkin, triagem, veredito binário APROVADA/REPROVADA |
| `engenheiro-devops` | CI/CD, deploy reversível, migrations, observabilidade, SLO, incidentes |

### Condutor, secretário e leis (não são o 13º membro)

| Skill | Papel |
|---|---|
| `equipe` | Orquestrador: pipeline com gates, fan-out/fan-in, loop de qualidade. Dono do `EQUIPE.md` quando conduz |
| `consolidar` | Secretário do `EQUIPE.md`: grava handoff de invocação **solta**. Não classifica modo, não despacha, não valida gate de produto |
| `skills-satelites` | Catálogo: qual especialista carrega cada satélite; comando → agente |
| `designer-checklist-mestre` | Lei de auditoria de design (30 blocos). Operada pelos dois designers no próprio turno |

Wrappers Cursor existem só para os **12 + `/equipe` + `/consolidar`**. Checklist e catálogo não são comandos `/`.

---

## Pipeline (`/equipe`)

`/equipe` não escreve código nem desenha tela. Classifica o trabalho, despacha o especialista certo, cobra o gate, paraleliza o independente e guarda estado no **`EQUIPE.md`** do *projeto consumidor* (não deste repo).

Fonte de verdade: [`skills/dev/equipe.md`](skills/dev/equipe.md). Pipeline executável: [`skills/dev/equipe.workflow.js`](skills/dev/equipe.workflow.js).

### Modos

| Modo | Quando | Recorte |
|---|---|---|
| **projeto-do-zero** | App, site ou SaaS novo | PM → fan-out arquiteto ‖ designers → implementação → craft → segurança → performance → tester → QA → devops |
| **feature-nova** | Produto existe, capacidade nova | Mini-PRD; arquiteto/segurança/perf só se o gatilho casar |
| **bugfix** | Comportamento errado no que já existia | Dev → tester (suíte inteira) → QA. Sem PM/designer, salvo causa-raiz |
| **redesign** | Funciona, precisa ficar premium | Designer → eng. de produto → tester (regressão visual + funcional) → QA |
| **auditoria** | Raio-X, sem construir | Fan-out leitura: segurança ‖ perf ‖ QA ‖ tester ‖ designer+impeccable |
| **resgate-de-projeto** | Travado, herdado, abandonado | Fan-out diagnóstico → plano → usuário aprova escopo → executa como zero ou feature |
| **consolidar** | Só gravar canvas (workflow) | Atualiza `EQUIPE.md` a partir de um handoff. Não despacha o time |

Na dúvida entre dois modos, o maestro escolhe o mais completo.

### `EQUIPE.md` (Project Canvas)

Todo ciclo vive num `EQUIPE.md` na **raiz do projeto em que se está construindo**. É a memória: visão, modo, estágio, quem tem o bastão, decisões (imutáveis — reversão é entrada nova), artefatos por caminho, pendências, riscos, histórico append-only.

O canvas **aponta**; não cola PRD. Se passou de ~200 linhas, está duplicando artefato. Canvas desatualizado é pior que canvas nenhum.

- Com `/equipe` no loop: o maestro escreve estágio/bastão/histórico.
- Sem `/equipe` (especialista solto): o especialista grava `docs/handoffs/YYYY-MM-DD-<skill>.md` e `/consolidar` upserta o canvas. Não avança o pipeline.

### Gates humanos (o workflow pausa)

Nenhum agente cruza sozinho: **mudança de escopo**, **custo** (serviço pago, plano, chave de API paga), **deploy em produção**, **operação destrutiva em dados**.

### Loop de qualidade

Gate de craft (`/impeccable audit` + `critique`) → `/engenheiro-seguranca` → `/engenheiro-performance` → `/tester` (4 dimensões) → `/qa-senior`. REPROVADA roteia o bug ao dono; o tester **re-roda a suíte inteira**. Só fecha APROVADA.

---

## Comandos da casa (frontend)

Ferramentas, não membros. O designer ou o engenheiro de produto opera no turno; o gate cobra o resultado.

### `/ui-ux-pro-max` — semente do design system

Inteligência de design (67 estilos, 96 paletas, 57 pares tipográficos, regras UX, 13 stacks). Entra no **início do estágio de design**, só quando **ainda não há marca/tokens**. Saída é ponto de partida: o designer reconverte para OKLCH / `tokens.ts` e reverifica contraste AA par a par. Output cru não passa no gate.

Não está neste repositório. Instale em `~/.claude/skills/ui-ux-pro-max/` (Claude Code). CLI típico:

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<tipo> <indústria> <keywords>" --design-system --persist -p "<Projeto>"
```

Persiste em `design-system/MASTER.md`. Defaults (glassmorphism, bento genérico) podem colidir com a lista anti-slop do designer — o sênior filtra.

### `/impeccable` — craft, auditoria e polish (web/DOM)

A skill mais completa do repo: `SKILL.md` + `reference/` + `scripts/` (detector de anti-patterns: regex, HTML estático, browser, contraste) + `agents/`.

Subcomandos em `skills/impeccable/reference/`: `init`, `shape`, `craft`, `critique`, `audit`, `polish`, `harden`, `animate`, `typeset`, `layout`, `colorize`, `bolder`, `quieter`, `clarify`, `distill`, `delight`, `optimize`, `adapt`, `extract`, `document`, `live`, `onboard`, `brand`, `product`, `hooks`, `interaction-design`, `overdrive`, `codex`.

Web-cêntrico. No mobile (RN/Expo) o especialista usa como motor de raciocínio de UX e **filtra** pela realidade nativa (Reanimated, expo-router, safe areas). Não há wrapper em `.cursor/skills/`: peça para seguir `skills/impeccable/SKILL.md`, ou linke a pasta no harness.

### `/framer-motion-animator` — motion declarativo

Transições de página, gestos, animações por scroll, sequências orquestradas. Casa com `/impeccable animate` e com a satélite `gsap-framer-scroll-animation` (GSAP + Framer). Também sem wrapper Cursor.

### Ordem no estágio de design

```
/ui-ux-pro-max (se sem marca) → reconversão OKLCH/tokens
→ taste-design + design-md (DESIGN.md)          # Stitch
→ enhance-prompt → stitch-generate-design       # telas
→ /impeccable shape/craft
→ design-critique + accessibility-review + /impeccable critique+audit
→ designer-checklist-mestre (triagem 01–30)
→ design-handoff
```

---

## Skills satélites (`.agents/skills/`)

~110 skills instaladas via `npx skills add`, pinadas em `skills-lock.json`. **Não são o time.** O especialista carrega `.agents/skills/<nome>/SKILL.md` (e os `references/` que ela apontar) **só se o trigger da missão casar** — não carrega o catálogo inteiro.

Fonte de roteamento: [`skills/dev/skills-satelites.md`](skills/dev/skills-satelites.md). Sem linha no catálogo **e** na seção SKILLS SATÉLITES do especialista dono, `/equipe` não despacha aquela ferramenta.

### Pacotes

| Pacote | Recorte | Quem opera |
|---|---|---|
| `supabase/agent-skills` | `supabase`, `supabase-postgres-best-practices` | Quem **modifica o banco**: `/arquiteto-senior` (desenho), `/dev-senior` (migration), `/engenheiro-devops` (CI); segurança/IA quando RLS/pgvector |
| `google-labs-code/stitch-skills` | Telas high-fidelity, DESIGN.md, código↔design, React/RN | Designers; eng. de produto / dev na conversão |
| `anthropics/knowledge-work-plugins` | Produto, engenharia, design, SQL, incidente, SEO, a11y… | O especialista da tabela abaixo |
| `github/awesome-copilot` | Recorte da stack da casa (PRD, GTM, Postgres, Playwright, GitHub Actions, eval/prompt, security-review…) | Idem; heurística no catálogo se uma skill nova aparecer |

**Fora do recorte (não instalar, não despachar):** sales, legal, HR, Zoom, standup, sprint Scrum, warehouse/BI, Azure, .NET, Java, Power BI, Qdrant, Salesforce. Substitutos: `prompt-builder` → `finalize-agent-prompt` + `prompt-optimizer`; `gh-cli` → `github-release` + `github-actions-*` + `devops-rollout-plan`.

### Instalados, mas não são o padrão da casa

`shadcn-ui`, `remotion`, `react-vite-dashboard` — a casa usa OKLCH e tokens próprios. Só se o PRD/ADR pedir; aí `/dev-senior` opera.

### Inventário por especialista

O `/equipe` injeta a lista no despacho. Trigger casa → o especialista lê a skill **antes** de trabalhar naquele domínio.

#### `/product-manager`

| Trigger | Skills |
|---|---|
| PRD / spec de feature | `write-spec`, `prd`, `create-specification`, `breakdown-feature-prd` |
| Problema, JTBD, OST | `product-brainstorming` |
| Pesquisa / síntese | `synthesize-research`, `user-research`, `research-synthesis` |
| Concorrência | `competitive-brief` |
| Roadmap / priorização | `roadmap-update` |
| Métricas / North Star | `metrics-review` |
| Stakeholder | `stakeholder-update` |
| Go-to-market | `gtm-0-to-1-launch`, `gtm-product-led-growth`, `gtm-positioning-strategy` |
| Landing / conversão (com designer) | `landing-page-conversion-audit`, `seo-audit`, `content-creation` |

#### `/arquiteto-senior` — banco (desenho)

| Trigger | Skills |
|---|---|
| Schema / migration / RLS / índice / tipo | `supabase-postgres-best-practices` **depois** `supabase` |
| SQL de análise | `sql-queries`, `write-query`, `postgresql-optimization`, `sql-optimization` |
| ADR | `architecture`, `create-architectural-decision-record` |
| Sistema / C4 | `system-design`, `architecture-blueprint-generator`, `cloud-design-patterns` |
| Repo existente (resgate) | `acquire-codebase-knowledge` |
| Plano de implementação | `create-implementation-plan` |
| Dívida técnica | `tech-debt` |

Sem as duas skills Supabase, não escreve SQL.

#### Designers (`/designer-sites-senior`, `/designer-saas-senior`)

| Trigger | Skills | Quem |
|---|---|---|
| Gerar / editar tela Stitch | `stitch-generate-design`, `enhance-prompt` | ambos |
| DESIGN.md / sistema visual | `design-md`, `taste-design`, `stitch-manage-design-system`, `stitch-extract-design-md` | ambos |
| Site multi-página | `stitch-loop`, `site-md` | sites |
| Código → Stitch (redesign) | `stitch-code-to-design`, `stitch-extract-static-html`, `stitch-upload-to-stitch` | sites |
| Stitch → React | `stitch-react-components` | sites + eng. produto |
| Stitch → React Native | `stitch-react-native` | saas + eng. produto |
| Crítica / handoff / a11y / copy | `design-critique`, `design-handoff`, `accessibility-review`, `ux-copy`, `design-system` | ambos |
| Anti-slop / review visual | `anti-ui-slop`, `web-design-reviewer`, `premium-frontend-ui` | ambos |
| Motion GSAP/Framer | `gsap-framer-scroll-animation` | sites |
| App Store | `apple-appstore-reviewer` | saas |
| Screenshots | `ui-screenshots` | ambos |
| SEO / copy / conversão | `seo-audit`, `content-creation`, `landing-page-conversion-audit` | sites |

Comandos da casa **antes** do Stitch: `/ui-ux-pro-max` → `/impeccable`. Checklist mestre na auditoria.

#### `/dev-senior` — banco (escrita)

| Trigger | Skills |
|---|---|
| Migration, RLS, Auth, Edge Function, Realtime, Storage | `supabase-postgres-best-practices` **depois** `supabase` |
| Query lenta / EXPLAIN | `postgresql-optimization`, `sql-optimization`, `sql-queries`, `write-query` |
| Review de SQL | `postgresql-code-review`, `sql-code-review` |
| Debug | `debug` |
| Code review / refactor | `code-review`, `review-and-refactor`, `refactor` |
| Commit / branch | `git-commit`, `conventional-commit`, `conventional-branch` |
| Docs técnicas | `documentation` |
| React 19 | `react19-concurrent-patterns`, `react19-test-patterns` |

Ordem canônica da fatia: migration+RLS → tipos → Zod → API → UI.

#### `/engenheiro-senior-produto`

`premium-frontend-ui`, `anti-ui-slop`, `web-design-reviewer`, `stitch-react-components` / `stitch-react-native`, `gsap-framer-scroll-animation`, `ux-copy`, e Supabase se a feature toca banco. Mais `/impeccable craft/animate/polish`.

#### `/engenheiro-ia`

`finalize-agent-prompt`, `prompt-optimizer`, `eval-driven-dev`, `agentic-eval`, `ai-prompt-engineering-safety-review`, `agent-governance`, `agent-owasp-compliance`. pgvector/RAG: as duas skills Supabase.

#### `/engenheiro-seguranca`

`security-review`, `audit-integrity`, `secret-scanning`, `dependabot`, `codeql`, `github-actions-hardening`, `gdpr-compliant`, `data-breach-blast-radius`, `threat-model-analyst`, `tm7-threat-model`, `mcp-security-audit`, `mcp-implementation-security-review`, `agent-owasp-compliance`, mais Supabase em RLS/Auth.

#### `/engenheiro-performance`

SQL/índice/RLS cara (`postgresql-*`, `sql-*`, Supabase); jornada web (`playwright-explore-website`, `chrome-devtools`, `playwright-generate-test`); gate no CI (`github-actions-efficiency`, `github-actions-hardening`). Entra **depois** da segurança e **antes** do tester.

#### `/tester`

`playwright-generate-test`, `playwright-explore-website`, `webapp-testing`, `chrome-devtools`, `javascript-typescript-jest`, `react19-test-patterns`, `bug-reproduction-brief`, `bug-receipt`, `testing-strategy`, `quality-playbook`, `accessibility-review`, `ui-screenshots`.

#### `/qa-senior`

`testing-strategy`, `quality-playbook`, `bug-reproduction-brief`, `bug-receipt`, `validate-data`.

#### `/engenheiro-devops`

`supabase` + `supabase-postgres-best-practices` (migrations em CI), `deploy-checklist`, `github-actions-efficiency`, `github-actions-hardening`, `create-github-action-workflow-specification`, `github-release`, `devops-rollout-plan`, `incident-response`, `incident-postmortem`, `secret-scanning`, `dependabot`.

#### `/equipe` (só orquestração)

`ai-team-orchestration`, `agent-skill-stack`. O maestro **não** opera satélites de ofício (banco, design, teste). `/consolidar` não puxa satélite.

### Comando → agente

Se o usuário invoca um comando de plugin (`/write-spec`, `/architecture`, `/debug`, …), `/equipe` despacha o especialista da tabela em [`skills/dev/skills-satelites.md`](skills/dev/skills-satelites.md) §2 — o comando nunca vira membro. Heurística awesome-copilot para skill nova: o nome aponta o dono (`prd`/`gtm` → PM, `postgres`/`adr` → arquiteto, `playwright`/`test` → tester, `security`/`owasp` → segurança, `github-actions`/`deploy` → devops, `ai-team-orchestration` → `/equipe`, …).

### Como atualizar

```bash
npx skills update          # na raiz deste repo
npx skills add <pacote> --skill <nome>   # recorte novo
```

Depois: linha no catálogo **e** na seção SKILLS SATÉLITES do especialista. Sem os dois, o maestro ignora.

---

## Uso detalhado

### Cursor

| Comando | De onde vem |
|---|---|
| `/product-manager` … `/engenheiro-devops`, `/equipe`, `/consolidar` | `.cursor/skills/<nome>/SKILL.md` → lê `skills/dev/<nome>.md` |
| Satélites | descobertas em `.agents/skills/` quando o especialista (ou o modelo) carrega a skill |
| `/impeccable`, `/framer-motion-animator` | **sem** wrapper; indique o caminho `skills/<pasta>/SKILL.md` |

Invocação solta: o especialista trabalha, grava handoff em `docs/handoffs/` do **projeto alvo**, e pede `/consolidar`. Para um ciclo com vários ofícios: `/equipe`.

### Claude Code / Agent SDK

1. Linke cada `skills/dev/<nome>.md` para `~/.claude/skills/<nome>/SKILL.md`.
2. Instale o workflow: copie `skills/dev/equipe.workflow.js` para `~/.claude/workflows/equipe.js`.
3. Satélites: `npx skills add` no projeto (ou reutilize `.agents/skills/` deste repo).
4. `/ui-ux-pro-max`: instale a skill globalmente; no repo de produto, coloque em `skills/ui-ux-pro-max/`.

Kickoff headless do workflow (gates humanos continuam valendo — deploy só com `autorizadoDeploy: true`):

```js
Workflow({
  name: "equipe",
  args: {
    brief: "o que construir",
    publico: "para quem",
    plataforma: "web", // | "mobile" | "ambos"
    modo: "auto",      // ou projeto-do-zero | feature-nova | bugfix | redesign | auditoria | resgate-de-projeto | consolidar
    root: ".",
    dataCiclo: "2026-08-28",
    autorizadoDeploy: false,
  },
})
```

---

## Contribuindo

- Uma skill de time por arquivo em `skills/dev/`. `description` específica o bastante para o roteamento acertar sozinho.
- Nada de instrução genérica que qualquer modelo já faria — o valor está no que é **opinativo**.
- Membro novo no roster de bastão: atualize `equipe.md`, `equipe.workflow.js`, wrapper em `.cursor/skills/`, tabela deste README e o catálogo se ele puxar satélites.
- Satélite nova: `npx skills add` → catálogo → seção do especialista dono → este README se o pacote ou a regra mudar.
- `/consolidar` não entra no ciclo do maestro. Não trate comando da casa nem satélite como 13º especialista.
