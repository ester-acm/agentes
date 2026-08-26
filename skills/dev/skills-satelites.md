---
name: "skills-satelites"
description: "Catálogo de roteamento das skills satélites da equipe: qual especialista carrega cada skill e em qual estágio do pipeline. Use quando /equipe despacha um especialista, quando um agente precisa saber qual ferramenta puxar, ou quando o usuário invoca um comando de knowledge-work, stitch, supabase ou awesome-copilot."
---

# SKILLS SATÉLITES — ROTEAMENTO AUTOMÁTICO

> Especialista segura o bastão. Satélite é ferramenta operada **dentro do turno**.
> `/equipe` nomeia as satélites no despacho. O especialista **carrega a skill antes de trabalhar** no domínio dela.
> Fonte de verdade deste arquivo. Skills instaladas em `.agents/skills/`.

**Regra de ouro:** satélite **não** segura bastão, **não** aparece no histórico de handoff como dono, **não** decide marca/arquitetura/veredito. Propõe; o sênior decide.

**Como carregar:** leia `.agents/skills/<nome>/SKILL.md` (e os `references/` que ela apontar) **antes** de escrever SQL, desenhar tela, auditar, commitar, etc.

---

## 1. QUEM PUXA O QUÊ (por especialista)

O `/equipe` injeta esta lista no despacho. O especialista puxa **só as satélites cujo trigger casou** com a missão — não carrega o catálogo inteiro.

### `/product-manager`

| Trigger | Skill | Pacote |
|---|---|---|
| Escrever PRD / spec de feature | `write-spec`, `prd`, `create-specification`, `breakdown-feature-prd` | KW + copilot |
| Explorar problema, JTBD, OST | `product-brainstorming` | KW |
| Pesquisa de usuário / síntese | `synthesize-research`, `user-research`, `research-synthesis` | KW |
| Concorrência | `competitive-brief` | KW |
| Roadmap / priorização | `roadmap-update` | KW |
| Métricas / North Star | `metrics-review` | KW |
| Update de stakeholder | `stakeholder-update` | KW |
| Go-to-market (lançamento, PLG, posicionamento) | `gtm-0-to-1-launch`, `gtm-product-led-growth`, `gtm-positioning-strategy` | copilot |
| Landing / conversão (com designer) | `landing-page-conversion-audit`, `seo-audit`, `content-creation` | copilot + KW |

**No fluxo:** kickoff → PRD. `write-spec`/`prd` **antes** de redigir o PRD. `product-brainstorming` na descoberta. `synthesize-research` quando há entrevistas.

### `/arquiteto-senior`  ← banco (desenho)

| Trigger | Skill | Pacote |
|---|---|---|
| **Qualquer schema / migration / RLS / índice / tipo de coluna** | `supabase-postgres-best-practices` **depois** `supabase` | supabase |
| SQL de análise / query do modelo | `sql-queries`, `write-query`, `postgresql-optimization`, `sql-optimization` | KW + copilot |
| ADR | `architecture`, `create-architectural-decision-record` | KW + copilot |
| Desenho de sistema / C4 | `system-design`, `architecture-blueprint-generator`, `cloud-design-patterns` | KW + copilot |
| Repo existente (resgate) | `acquire-codebase-knowledge` | copilot |
| Plano de implementação | `create-implementation-plan` | copilot |
| Dívida técnica | `tech-debt` | KW |

**No fluxo:** FASE 2 (modelar) **abre** carregando `supabase-postgres-best-practices` + `supabase`. Sem isso, não escreve SQL.

### `/designer-sites-senior` e `/designer-saas-senior`

| Trigger | Skill | Quem | Pacote |
|---|---|---|---|
| Gerar / editar tela no Stitch | `stitch-generate-design`, `enhance-prompt` | ambos | stitch |
| DESIGN.md / sistema visual Stitch | `design-md`, `taste-design`, `stitch-manage-design-system`, `stitch-extract-design-md` | ambos | stitch |
| Site multi-página via Stitch | `stitch-loop`, `site-md` | sites | stitch |
| Código → Stitch (redesign) | `stitch-code-to-design`, `stitch-extract-static-html`, `stitch-upload-to-stitch` | sites | stitch |
| Stitch → React | `stitch-react-components` | sites + eng. produto | stitch |
| Stitch → React Native | `stitch-react-native` | saas + eng. produto | stitch |
| Crítica / handoff / a11y / UX copy | `design-critique`, `design-handoff`, `accessibility-review`, `ux-copy`, `design-system` | ambos | KW |
| Anti-slop / review visual | `anti-ui-slop`, `web-design-reviewer`, `premium-frontend-ui` | ambos | copilot |
| Motion GSAP/Framer | `gsap-framer-scroll-animation` | sites | copilot |
| App Store (mobile) | `apple-appstore-reviewer` | saas | copilot |
| Screenshots de UI | `ui-screenshots` | ambos | copilot |
| SEO / copy de landing | `seo-audit`, `content-creation` | sites | KW |
| Conversão de landing | `landing-page-conversion-audit` | sites | copilot |

**Já existentes (não satélites, comandos da casa):** `/ui-ux-pro-max` (semente) → `/impeccable` (craft). Stitch entra **depois** da semente, **antes** do handoff.

**Ordem no estágio de design:**
```
/ui-ux-pro-max (se sem marca) → reconversão OKLCH/tokens
→ taste-design + design-md (DESIGN.md)
→ enhance-prompt → stitch-generate-design (telas)
→ /impeccable shape/craft
→ design-critique + accessibility-review + /impeccable critique+audit
→ design-handoff
```

### `/dev-senior`  ← banco (escrita)

| Trigger | Skill | Pacote |
|---|---|---|
| **Qualquer migration, RLS, Auth, Edge Function, Realtime, Storage** | `supabase-postgres-best-practices` **depois** `supabase` | supabase |
| Query lenta / índice / EXPLAIN | `postgresql-optimization`, `sql-optimization`, `sql-queries`, `write-query` | copilot + KW |
| Review de SQL | `postgresql-code-review`, `sql-code-review` | copilot |
| Debug de bug funcional | `debug` | KW |
| Code review | `code-review`, `review-and-refactor` | KW + copilot |
| Refactor | `refactor` | copilot |
| Commit / branch | `git-commit`, `conventional-commit`, `conventional-branch` | copilot |
| Docs técnicas | `documentation` | KW |
| React 19 | `react19-concurrent-patterns`, `react19-test-patterns` | copilot |

**No fluxo:** Playbook 6 (Supabase) **abre** carregando as duas skills supabase. Ordem canônica da fatia: migration+RLS → tipos → Zod → API → UI.

### `/engenheiro-senior-produto`

| Trigger | Skill | Pacote |
|---|---|---|
| UI premium / anti-slop | `premium-frontend-ui`, `anti-ui-slop`, `web-design-reviewer` | copilot |
| Stitch → código | `stitch-react-components` (web), `stitch-react-native` (mobile) | stitch |
| Motion | `gsap-framer-scroll-animation` | copilot |
| UX copy nas superfícies | `ux-copy` | KW |
| Schema da feature (quando toca banco) | `supabase` + `supabase-postgres-best-practices` | supabase |

Mais `/impeccable craft/animate/polish` (comando da casa).

### `/engenheiro-ia`

| Trigger | Skill | Pacote |
|---|---|---|
| Prompt / eval / qualidade | `finalize-agent-prompt`, `prompt-optimizer`, `eval-driven-dev`, `agentic-eval` | copilot |
| Segurança de prompt / agente | `ai-prompt-engineering-safety-review`, `agent-governance`, `agent-owasp-compliance` | copilot |
| pgvector / RAG no Postgres | `supabase-postgres-best-practices`, `supabase` | supabase |

### `/engenheiro-seguranca`

| Trigger | Skill | Pacote |
|---|---|---|
| Auditoria geral | `security-review`, `audit-integrity` | copilot |
| RLS / Auth Supabase | `supabase`, `supabase-postgres-best-practices` | supabase |
| Secrets / supply chain | `secret-scanning`, `dependabot`, `codeql`, `github-actions-hardening` | copilot |
| LGPD | `gdpr-compliant`, `data-breach-blast-radius` | copilot |
| Threat model | `threat-model-analyst`, `tm7-threat-model` | copilot |
| MCP / agente | `mcp-security-audit`, `mcp-implementation-security-review`, `agent-owasp-compliance` | copilot |

### `/engenheiro-performance`

| Trigger | Skill | Pacote |
|---|---|---|
| Query lenta / índice / EXPLAIN | `postgresql-optimization`, `sql-optimization`, `sql-queries`, `write-query` | KW + copilot |
| Índice, RLS cara, `pg_stat_statements` | `supabase-postgres-best-practices` **depois** `supabase` | supabase |
| Medir jornada web / requests por tela | `playwright-explore-website`, `chrome-devtools`, `playwright-generate-test` | copilot |
| Gate no CI (bundle, Lighthouse, k6) | `github-actions-efficiency`, `github-actions-hardening` | copilot |
| Review de SQL que vai mudar | `postgresql-code-review`, `sql-code-review` | copilot |

**No fluxo:** depois da segurança, **antes** do `/tester`. Modo 1 (auditoria estrutural) no projeto-do-zero e no MODO 5; Modo 2 (gate de feature) na feature com UI/API/LLM; Modo 3 (release) no pré-deploy. Bugfix só se o bug é de lentidão.

### `/tester`

| Trigger | Skill | Pacote |
|---|---|---|
| Playwright / E2E web | `playwright-generate-test`, `playwright-explore-website`, `webapp-testing`, `chrome-devtools` | copilot |
| Unitário JS/TS | `javascript-typescript-jest`, `react19-test-patterns` | copilot |
| Bug report / reprodução | `bug-reproduction-brief`, `bug-receipt` | copilot |
| Estratégia de cobertura | `testing-strategy`, `quality-playbook` | KW + copilot |
| A11y | `accessibility-review` | KW |
| Visual | `ui-screenshots` | copilot |

### `/qa-senior`

| Trigger | Skill | Pacote |
|---|---|---|
| Estratégia / qualidade | `testing-strategy`, `quality-playbook` | KW + copilot |
| Bug report padrão-ouro | `bug-reproduction-brief`, `bug-receipt` | copilot |
| Validar análise / dados de teste | `validate-data` | KW |

### `/engenheiro-devops`

| Trigger | Skill | Pacote |
|---|---|---|
| **Migrations em CI / `supabase db push` / config.toml** | `supabase` + `supabase-postgres-best-practices` | supabase |
| Checklist pré-deploy | `deploy-checklist` | KW |
| GitHub Actions | `github-actions-efficiency`, `github-actions-hardening`, `create-github-action-workflow-specification` | copilot |
| Release | `github-release`, `devops-rollout-plan` | copilot |
| Incidente / postmortem | `incident-response`, `incident-postmortem` | KW + copilot |
| Secrets no pipeline | `secret-scanning`, `dependabot` | copilot |

### `/equipe` (condutor)

| Trigger | Skill | Pacote |
|---|---|---|
| Orquestrar o time | `ai-team-orchestration` | copilot |
| Auditar o stack de skills do projeto | `agent-skill-stack` | copilot |

`/equipe` **não** opera satélites de ofício (banco, design, teste). Só roteia.
`/consolidar` **não** entra no ciclo do maestro — só quando um especialista foi invocado solto.

---

## 2. COMANDO → AGENTE (auto-dispatch)

Quando o usuário (ou um plugin) invoca um **comando**, `/equipe` despacha o especialista da tabela — o especialista puxa a skill de mesmo nome (ou a satélite listada). Comando **nunca** vira membro do time.

### Knowledge-work (comandos oficiais)

| Comando | Agente que puxa | Skill carregada |
|---|---|---|
| `/write-spec` `/brainstorm` | `/product-manager` | `write-spec` / `product-brainstorming` |
| `/roadmap-update` `/stakeholder-update` `/synthesize-research` `/competitive-brief` `/metrics-review` | `/product-manager` | skill homônima |
| `/architecture` | `/arquiteto-senior` | `architecture` + `system-design` |
| `/review` | `/dev-senior` (código) ou `/engenheiro-seguranca` (se o pedido é auditoria) | `code-review` / `security-review` |
| `/debug` | `/dev-senior` | `debug` |
| `/consolidar` | `/consolidar` (secretário — **não** despacha especialista) | skill homônima |
| lentidão, p95, Core Web Vitals, carga | `/engenheiro-performance` | skill homônima |
| `/incident` | `/engenheiro-devops` | `incident-response` |
| `/deploy-checklist` | `/engenheiro-devops` | `deploy-checklist` |
| `/critique` `/design-system` `/handoff` `/ux-copy` `/accessibility` | designer da plataforma | `design-critique` / `design-system` / `design-handoff` / `ux-copy` / `accessibility-review` |
| `/research-synthesis` | `/product-manager` (pesquisa de produto) ou designer (pesquisa de UX) | `synthesize-research` / `research-synthesis` |
| `/analyze` `/explore-data` `/write-query` `/validate` | `/arquiteto-senior` se for modelo; `/dev-senior` se for query de implementação; `/product-manager` se for métrica de produto | `write-query` / `explore-data` / `validate-data` / `metrics-review` |
| `/seo-audit` `/draft-content` | `/designer-sites-senior` (superfície) + `/product-manager` (mensagem) | `seo-audit` / `content-creation` |
| `/runbook` | `/engenheiro-devops` | `incident-response` + playbook de runbook da skill devops |

### Stitch (skills = comandos)

| Comando / skill | Agente |
|---|---|
| `stitch-generate-design` `enhance-prompt` `taste-design` `design-md` `stitch-manage-design-system` `stitch-extract-design-md` `stitch-upload-to-stitch` | designers |
| `stitch-loop` `site-md` `stitch-code-to-design` `stitch-extract-static-html` | `/designer-sites-senior` |
| `stitch-react-components` | `/designer-sites-senior` especifica; `/engenheiro-senior-produto` / `/dev-senior` implementam |
| `stitch-react-native` | `/designer-saas-senior` especifica; `/engenheiro-senior-produto` / `/dev-senior` implementam |
| `shadcn-ui` `react-vite-dashboard` `remotion` | **não** são o padrão da casa (OKLCH/tokens próprios). Só se o PRD/ADR pedir explicitamente — aí `/dev-senior` |

### Awesome-copilot (skill = comando)

Toda skill do recorte mapeia 1:1 para o agente da seção 1. Heurística se uma skill nova aparecer:

| Nome contém | Agente |
|---|---|
| `prd`, `spec`, `gtm`, `roadmap`, `launch` | `/product-manager` |
| `architect`, `adr`, `postgres`, `sql-`, `cloud-design`, `codebase-knowledge` | `/arquiteto-senior` |
| `ui`, `design`, `slop`, `gsap`, `appstore`, `screenshot`, `landing` | designer da plataforma |
| `perf`, `lighthouse`, `k6`, `web-vitals`, `query lenta`, `n+1` | `/engenheiro-performance` |
| `git-`, `commit`, `branch`, `refactor`, `react19` | `/dev-senior` |
| `prompt`, `eval`, `agentic`, `agent-governance` | `/engenheiro-ia` |
| `security`, `secret`, `gdpr`, `threat`, `owasp`, `codeql`, `mcp-security` | `/engenheiro-seguranca` |
| `playwright`, `test`, `jest`, `bug-`, `quality-playbook`, `chrome-devtools` | `/tester` (bug report também `/qa-senior`) |
| `github-actions`, `deploy`, `release`, `devops`, `incident-postmortem` | `/engenheiro-devops` |
| `ai-team-orchestration`, `agent-skill-stack` | `/equipe` |

---

## 3. O QUE NÃO ENTROU (knowledge-work)

Analisados e **excluídos** — não servem a um time de software enxuto neste repo:

- **sales, finance, legal, HR, bio-research, small-business, customer-support** — outro ofício
- **enterprise-search, cowork-plugin-management, partner-built, pdf-viewer, zoom SDKs** — infra de Cowork / nicho
- **productivity / standup / slack-messaging** — cerimônia, não entrega
- **sprint-planning** — o PM da casa prioriza por outcome, não por sprint Scrum
- **campaign-planning, email-sequence, performance-analytics** (marketing pesado) — só `seo-audit` + `content-creation` para landing
- **operations** (vendor, capacity, change-request corporativo) — o `/engenheiro-devops` já cobre runbook/incidente
- **data:** `build-dashboard`, `create-viz`, `statistical-analysis` — warehouse/BI, não o Postgres da casa

**awesome-copilot:** 400+ skills. Instalado só o recorte da stack da casa (Next.js, Expo, Supabase, Playwright, GitHub, LLM). Azure, .NET, Java, Power BI, Qdrant, Oracle→Postgres, Salesforce **fora**. A heurística da seção 2 cobre o resto se alguém instalar depois.

Não existem neste pacote (não instalar, não despachar): `prompt-builder` (use `finalize-agent-prompt` + `prompt-optimizer`) e `gh-cli` (use `github-release` + `github-actions-*` + `devops-rollout-plan`).

---

## 4. ONDE VIVE E COMO ATUALIZAR

```
.agents/skills/<nome>/SKILL.md    ← instalado por `npx skills add` (descoberta do agente)
skills/dev/skills-satelites.md    ← este catálogo (roteamento)
skills/dev/*.md                   ← os 12 especialistas + /equipe + /consolidar
```

Atualizar satélites: `npx skills update` na raiz. Recorte novo: instale com `--skill` e **adicione a linha neste catálogo + na seção SKILLS SATÉLITES do especialista**. Sem linha no catálogo, `/equipe` não despacha.
