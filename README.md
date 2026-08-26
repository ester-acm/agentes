# agentes

Repositório de **agentes de IA focados em desenvolvimento de software**.

Aqui não há aplicação, build ou runtime: este repo guarda apenas os *prompts* — as skills que definem o comportamento de agentes especialistas (product manager, arquiteto, designers, devs, segurança, QA, DevOps) usados em outros projetos. O conteúdo versionado é markdown de instrução, mais os scripts auxiliares que algumas skills chamam.

## Estrutura

```
skills/
├── dev/                      # os 11 especialistas + o orquestrador + catálogo de satélites
├── framer-motion-animator/   # skill de animação com Framer Motion
└── impeccable/               # craft, auditoria e polish de frontend
.agents/skills/               # satélites instaladas via `npx skills add` (fonte de verdade)
```

Cada skill de especialista é um arquivo markdown com frontmatter (`name`, `description`) seguido do system prompt. A `description` é o que decide quando o agente é acionado — ela é lida pelo modelo para escolher a skill certa.

Satélites **não** são membros do time: o especialista carrega `.agents/skills/<nome>/SKILL.md` dentro do próprio turno. Roteamento (quem puxa o quê, comando → agente): `skills/dev/skills-satelites.md`.

## O time (`skills/dev/`)

| Skill | Papel |
|---|---|
| `product-manager` | Descoberta, PRD customer-backwards, priorização, o que **não** construir |
| `arquiteto-senior` | Stack, modelo de dados PostgreSQL, RLS multi-tenant, contratos de API, ADRs |
| `designer-sites-senior` | Web premium: direção de arte, tipografia, motion, WCAG 2.2, Core Web Vitals |
| `designer-saas-senior` | App mobile: React Native/Expo, Apple HIG, Material 3, navegação e estados |
| `dev-senior` | Implementação full-stack ponta a ponta — produto final, nunca MVP |
| `engenheiro-senior-produto` | A ponte design↔engenharia: features polidas, micro-interações, Stripe |
| `engenheiro-ia` | LLM em produção: prompting, RAG (pgvector), tool use, evals, guardrails |
| `engenheiro-seguranca` | Auditoria ofensiva + defensiva: OWASP, RLS, webhooks, LGPD, CVSS |
| `tester` | SDET: Playwright, Maestro/Detox, Vitest, a11y, regressão visual, Lighthouse CI |
| `qa-senior` | Estratégia de teste por risco, Gherkin, triagem de bugs, veredito binário |
| `engenheiro-devops` | CI/CD, deploy reversível, migrations, observabilidade, SLO, incidentes |
| `equipe` | Orquestrador: pipeline com gates, fan-out/fan-in e loop de qualidade |
| `skills-satelites` | Catálogo: qual especialista carrega cada satélite; comando → agente |
| `designer-checklist-mestre` | Lei de auditoria de design (30 blocos) — operada pelos dois designers |

`equipe` acompanha um `equipe.workflow.js` — o pipeline determinístico que encadeia os especialistas acima e pausa nos gates humanos (escopo, custo, produção, dados).

## Skills de frontend

- **`impeccable`** — a mais completa do repo: além do `SKILL.md`, traz `reference/` (audit, critique, polish, harden, animate, colorize, typeset, layout…), `scripts/` com detector de anti-patterns (engines regex, HTML estático, browser e contraste visual) e `agents/`.
- **`framer-motion-animator`** — transições de página, gestos, animações por scroll e sequências orquestradas.

## Skills satélites (`.agents/skills/`)

Instaladas com `npx skills add`. Atualizar: `npx skills update` na raiz. Recorte novo entra no catálogo `skills/dev/skills-satelites.md` **e** na seção SKILLS SATÉLITES do especialista dono.

| Pacote | Recorte | Quem opera |
|---|---|---|
| `supabase/agent-skills` | `supabase`, `supabase-postgres-best-practices` | Quem **modifica o banco**: `/arquiteto-senior` (desenho), `/dev-senior` (migration), `/engenheiro-devops` (CI); segurança/IA quando RLS/pgvector |
| `google-labs-code/stitch-skills` | Stitch (generate-design, taste-design, design-md, react-native, react-components, …) | Designers; engenheiro de produto / dev na hora de virar código |
| `anthropics/knowledge-work-plugins` | Só o recorte de produto/engenharia/design (spec, ADR, critique, a11y, SQL, incidente, SEO…). Sales, legal, HR, Zoom, standup **fora** | O especialista da tabela comando→agente no catálogo |
| `github/awesome-copilot` | Recorte da stack da casa (PRD, GTM, Postgres, Playwright, GitHub Actions, eval/prompt, security-review…). Azure/.NET/Java **fora** | Idem — heurística no catálogo se uma skill nova aparecer |

`shadcn-ui`, `remotion` e `react-vite-dashboard` estão instalados mas **não** são o padrão da casa (OKLCH/tokens próprios) — só se o PRD/ADR pedir.

## Uso

As skills são consumidas pelo Claude Code / Claude Agent SDK. Para usá-las, copie ou linke o diretório da skill para onde o seu agente procura skills (por exemplo `~/.claude/skills/` ou `.claude/skills/` do projeto) e invoque pelo nome — `/dev-senior`, `/impeccable`, `/equipe`.

Os prompts estão em português; código, identificadores e commits, em inglês.

## Contribuindo

Uma skill por arquivo, `description` específica o bastante para o roteamento acertar sozinho, e nada de instrução genérica que qualquer modelo já faria por padrão — o valor está no que é opinativo.
