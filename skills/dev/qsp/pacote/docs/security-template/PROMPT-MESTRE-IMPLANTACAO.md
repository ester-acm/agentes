# PROMPT MESTRE — Implantação do padrão de Segurança, Qualidade e Validação

**Versão do pacote:** V1.1 (proteção permanente ALWAYS / IMPACT / PERIODIC / HUMAN + QSP Gate + coverage drift)  
**Uso:** aponte este arquivo ao agente (Cursor).  
**Pacote operacional:** POP + Ficha + Template Técnico.  
**Checklist Geral:** referência corporativa **complementar** — **não** é quarto componente obrigatório.

```
QUALITY · SECURITY · PERFORMANCE
```

*(Nomes dos pilares — sem status. Status só após execução com evidência.)*

Adaptar à arquitetura **real** do sistema. Nunca copiar ferramentas, thresholds, papéis ou configs de outro produto.

---

## Regra universal de evidência

```
CONFIGURADO ≠ VALIDADO
```

Exemplos:

| Configurado | Não prova |
|-------------|-----------|
| workflow criado | Gate validado |
| teste escrito | teste executado |
| scanner configurado | scanner executado |
| policy existente | isolamento comprovado |
| script de Performance existente | Performance validada |

Um pilar somente pode receber **✅ VALIDADA** quando os controles **aplicáveis** tiverem sido efetivamente **EXECUTADOS** e houver **evidência suficiente**.

---

## Paths oficiais

| Artefato | Caminho |
|----------|---------|
| **POP** | `docs/security/POP-seguranca-qualidade-validacao-sistemas.md` |
| **Ficha do sistema** | `docs/security/FICHA-conhecimento-seguranca-sistema.md` |
| **Modelo da Ficha** | `docs/security/FICHA-conhecimento-seguranca-sistema-template.md` |
| **Template Técnico** | `docs/security-template/` |
| **Prompt Mestre** | `docs/security-template/PROMPT-MESTRE-IMPLANTACAO.md` |

Trabalhar sempre na **cópia do sistema** da Ficha. Não inventar outro formato.

---

## Fluxo operacional (obrigatório)

```
FASE 1
→ análise preliminar (só para preencher a Ficha)
→ pré-preencher Ficha
→ status EM VALIDAÇÃO
→ HARD STOP (único checkpoint humano obrigatório de negócio)

HUMANO
→ esclarece só regras de negócio necessárias
→ marca Ficha VALIDADA

ORDEM ÚNICA:
“A Ficha está VALIDADA. Execute a implantação completa.”
(ou equivalente: Ficha VALIDADA + pedido de implantação completa)

→ FASE 2 (automaticamente)
→ FASE 3 / FECHAMENTO (automaticamente, sem nova autorização)
→ UMA lista final: AÇÕES HUMANAS RESTANTES
```

**Não** exigir nova autorização entre Fase 2 e Fase 3.  
**Não** parar a cada pendência humana não bloqueante.  
**Não** fazer auditoria técnica profunda / correções antes da Ficha **VALIDADA**.

---

## Escopo de autorização da “implantação completa”

A ordem:

> A Ficha está VALIDADA. Execute a implantação completa.

**autoriza automaticamente:**

- análise;
- branch local;
- alterações locais;
- testes;
- Docker / ambiente local;
- correções;
- regressões;
- documentação;
- preparação de workflows;
- baseline.

**NÃO autoriza automaticamente:**

- `git push`;
- PR real;
- criação / alteração de ruleset remoto;
- alteração GitHub / GitLab remoto;
- Cloudflare / Vercel / Netlify (ou equivalente);
- Supabase remoto (ou backend cloud remoto);
- secrets;
- deploy;
- migration remota;
- produção;
- qualquer efeito externo de **escrita**.

Essas ações exigem **autorização explícita** ou **política previamente documentada** do projeto que já as autorize.  
Sem isso: registrar como **🔎 AÇÃO HUMANA** e **continuar** o restante quando não for bloqueante.

---

## Instruções gerais ao agente

1. Ler o POP e este Template Técnico.
2. Trabalhar a Ficha do sistema (criar na Fase 1 se necessário).
3. **Não** alterar produção. Preferir branch + local/staging/descartável.
4. **Não** inventar regra de negócio. Código = implementado; Ficha VALIDADA = esperado.
5. Se regra crítica for inferida **somente** do código → marcar como **inferida / pendente de validação**. Código implementado **nunca** substitui fonte de regra de negócio.
6. **Nunca** declarar “sistema 100% seguro” ou “invulnerável”.
7. **Nunca** solicitar password, token, API key ou secret ao humano.

### Classificação de itens

| Símbolo | Significado |
|---------|-------------|
| 🔴 | BLOQUEANTE para implantação real do padrão |
| 🟡 | NÃO BLOQUEANTE — pode restar com plano |
| 🔎 | AÇÃO HUMANA NECESSÁRIA |
| ➖ | NÃO SE APLICA (só com justificativa arquitetural) |

Um item pode ser simultaneamente 🔎 e 🔴.

---

# FASE 1 — Conhecer o sistema e pré-preencher a Ficha

## Objetivo

Mapear **preliminarmente** arquitetura/stack/superfícies e pré-preencher a Ficha com **evidências**.  
Status ao final: **EM VALIDAÇÃO**. O agente **nunca** marca VALIDADA.

A análise preliminar existe **apenas** para preencher corretamente a Ficha — **não** para corrigir o sistema.

## Passos

1. Ler POP e Template Técnico.
2. Garantir Ficha do sistema (copiar do modelo se não existir).
3. Analisar repositório, docs, stack, auth, roles, isolamento, storage, integrações, pagamentos, IA, dados pessoais, fluxos críticos, superfícies.
4. Pré-preencher **somente** com evidências; marcar inferências do código como pendentes de validação.
5. Status → **EM VALIDAÇÃO**.
6. **HARD STOP.**

### Não fazer na Fase 1

Corrigir código · migrations · policies · API · roles · produção · iniciar implantação técnica · marcar VALIDADA · inventário amplo de Security/Performance com correções.

### Parada humana (única obrigatória de negócio)

Apresentar: arquitetura; campos preenchidos; incertezas; contradições; decisões de Produto; comportamentos aparentemente perigosos (**sem corrigir**).

Encerrar exatamente com:

> FASE 1 CONCLUÍDA — aguardando validação humana da Ficha. Não iniciarei a implantação técnica enquanto o status da Ficha não estiver VALIDADA.

---

# Regra da Ficha (todas as fases)

| Status | Significado |
|--------|-------------|
| RASCUNHO / EM VALIDAÇÃO | Ficha **não** autoriza correções baseadas em negócio |
| **VALIDADA** | Autoriza comparar esperado × implementado e corrigir gaps |

O agente **nunca** altera sozinho para VALIDADA.

---

# IMPLANTAÇÃO COMPLETA (Fase 2 + Fase 3 contínuas)

## Pré-condição

| | Condição |
|---|----------|
| **A** | Ficha em `docs/security/FICHA-conhecimento-seguranca-sistema.md` com status **VALIDADA** |
| **B** | Humano pediu implantação completa (ex.: “A Ficha está VALIDADA. Execute a implantação completa.”) |

Se A ou B faltar: **não** iniciar. Informar o que falta.

## Modo autônomo (obrigatório)

Após a pré-condição, executar **sozinho** tudo que for possível **localmente / na branch**, dentro do escopo de autorização acima:

aprofundar mapeamento · Security · Quality · Performance · gaps · correções · testes · regressões · **mapa permanente de cobertura QSP** · classificação ALWAYS/IMPACT/PERIODIC/HUMAN · Gate (ALWAYS+IMPACT+agregador) · coverage drift · scanners leves · periódico ampliado · baseline · documentação · evidências · lab de Gate (somente se push/PR/remoto estiverem **explicitamente** autorizados).

### Regra V1.1 — Implantação → proteção permanente

```
Controle aplicável + validado + automatizável
→ OBRIGATÓRIO no mapa QSP REAL do projeto
→ ligado a ALWAYS | IMPACT | PERIODIC
(HUMAN só se realmente não automatizável + humanJustification)
```

**PROIBIDO** encerrar com controle só como “VALIDADO NA BASELINE” sem frequência futura.  
Isso = proteção permanente **INCOMPLETA**.

Teste executado **somente** na implantação local **NÃO** encerra o controle.  
Não deixar RLS / Storage / Edge / RPC / jobs / Performance DB|API|Edge “sumirem” depois da baseline.

### Mapa REAL (não o example)

O arquivo `coverage/qsp-coverage-map.example.json` é **modelo**.  
O agente **NÃO** copia o example como mapa definitivo.

Durante a implantação completa deve:

1. mapear o sistema;
2. executar Security / Quality / Performance;
3. identificar controles realmente aplicáveis;
4. **criar** `docs/security/qsp-coverage-map.json` (+ MD) **deste** projeto;
5. classificar cada controle (ALWAYS/IMPACT/PERIODIC/HUMAN);
6. ligar executores/comandos reais;
7. definir `globalImpactPaths` do projeto;
8. adaptar Gate + periódico;
9. validar mapa (`qsp-validate-map`) + executar + evidenciar;
10. só então considerar proteção permanente instalada.

Quando ambiente descartável for tecnicamente viável no CI: **runtime real**. Markers **complementam**, não substituem. Se runtime inviável: justificar no mapa (`runtimeJustification` / evidence).

### Quando encontrar ação humana NÃO BLOQUEANTE

```
REGISTRAR → CLASSIFICAR → CONTINUAR
```

Não parar. Acumular para a seção final.

### Só interromper imediatamente se

1. Faltar decisão de negócio indispensável e **não** definida na Ficha;
2. Faltar informação sem a qual a maior parte do trabalho técnico restante fica impedida;
3. A próxima ação **indispensável** exigir escrita remota / produção / ambiente externo destrutivo / alteração irreversível **sem** autorização;
4. Houver risco irreversível claro.

Mesmo assim: antes de parar, executar tudo que ainda for **independente** da pendência.

### Preferência de ambiente

```
branch / clone → local / staging / descartável → mapear → testar → corrigir → retestar → (lab Gate se autorizado) → evidências
```

Sem merge/deploy automático. Sem alteração direta em produção nesta implantação. Sem push/PR/remoto automático.

---

## A. Security — inventário amplo + controles

### Antes dos testes (obrigatório)

Produzir **inventário amplo** das superfícies **aplicáveis** ao sistema (não tratar listas de exemplo como exaustivas).

Avaliar conforme arquitetura, entre outras famílias relevantes:

- autenticação e sessão;
- autorização;
- isolamento / multi-tenant;
- input validation / injections;
- APIs;
- webhooks / callbacks;
- SSRF quando aplicável;
- browser / client;
- CORS / CSRF / headers quando aplicável;
- banco;
- storage / uploads;
- secrets;
- integrações externas;
- jobs / filas / crons;
- rate limiting / abuso;
- regras de negócio;
- pagamentos;
- IA / agentes / RAG;
- cache / CDN;
- CI/CD e supply chain;
- logs / auditoria / monitoramento;
- backup / recuperação;
- privacidade / dados;
- outras superfícies encontradas na arquitetura.

**Não** obrigar categorias que não se aplicam.  
**➖ N/A** somente com **justificativa arquitetural**.

### Princípios (permanecem)

- **Autenticação ≠ autorização.** Sessão/JWT válido não autoriza ação.
- Autorização deve validar: **identidade + tenant/org/escopo + recurso específico + ação**.
- Testar **IDOR** (trocar IDs / recursos de outro usuário ou escopo).
- Testar **self privilege escalation** (usuário eleva o próprio papel/flag/escopo).
- Isolamento entre tenants/escopos conforme a Ficha.
- Regras críticas no **backend** (API, policies, RPC, middleware) — UI não basta.

### Controles importantes (dentro do inventário — quando existirem)

| Tema | O que verificar |
|------|-----------------|
| Auth | Login, sessão, MFA (se Ficha), recuperação, desativação / sessões |
| Authz | Roles, permissões, recurso-alvo |
| Banco | RLS/policies ou equivalente; grants |
| RPC / functions | `SECURITY DEFINER` / privilégio; `GRANT EXECUTE` a roles públicas |
| Edge / server functions | Caller validado; uso de `service_role` / admin key |
| Gateway JWT × código | JWT off no gateway **não** implica função aberta — validar no código |
| Cron / jobs | Secret ou mecanismo equivalente; **fail-closed** sem credencial; JWT de usuário **não** dispara job privilegiado |
| Secrets | Não no client; scanners adequados (client **não** substitui repo/CI/histórico) |
| CORS / CSRF / headers | Allowlist explícita quando aplicável |
| Integrações / webhooks | Authz **antes** de side-effect; quem pode provocar callbacks |
| Dependências | Audit no periódico; triagem; High/Critical explorável no contexto pode ser 🔴 |
| Config externa × código | Painel/cloud pode divergir do repo — evidência humana quando necessário |

### Integrações externas

- Não fazer carga/stress contra providers reais (IA, storage de mídia, pagamentos) sem autorização.
- Separar tempo do **nosso sistema** da latência do **provider**.
- DPA/contratos: 🔎 Compliance — não inventar conclusão jurídica; não bloquear validação técnica local salvo decisão explícita.

### Testes mínimos por regra crítica da Ficha

Positivo · Negativo · Isolamento (quando aplicável) · Regressão no Gate — **executados**, não apenas escritos.

Placeholders críticos de CI/teste **não** podem produzir PASS / falso verde. Devem falhar de forma inequívoca até serem adaptados (`NÃO CONFIGURADO / INCOMPLETO`).

---

## B. Quality

Conforme stack, implantar e **executar** (quando aplicável):

- lint / análise estática;
- typecheck / equivalente;
- testes;
- build / compile / package;
- scanner de secrets **adequado** ao risco (client, repo, CI, histórico — conforme necessidade);
- regressões das regras tocadas.

**Não** obrigar conceitos específicos de Node/Vite/npm. Adaptar ao runtime do projeto.

### Cuidados de CI (genéricos)

- Variáveis **placeholder** seguras quando testes importam clients de API (sem secrets reais).
- Seed/migrations **executáveis no CI** (sem presupor meta-comandos interativos quebrados).
- Não assumir ferramentas de um produto específico.
- Módulo/placeholder obrigatório ainda não adaptado → **fail-closed** (não PASS).

**READY FOR QA** somente com checks obrigatórios aplicáveis **executados e verdes** (inclui Performance quando o pilar for aplicável e baseline existir).

---

## C. Performance — padrão obrigatório

### Critério de VALIDADA

Performance **NÃO** pode ser ✅ só porque bundle passou, login passou, um job CI ficou verde ou um script existe.

```
CONFIGURADO ≠ VALIDADO
```

Na **implantação inicial**, exigir inventário amplo das categorias **aplicáveis**:

FRONTEND · API · BACKEND · EDGE/SERVER FUNCTIONS · BANCO · RPC · JOBS · CRONS · BUNDLE · ARQUIVOS · INTEGRAÇÕES relevantes.

Para cada categoria aplicável:

```
mapear → representantes por COMPORTAMENTO (não só por URL)
→ medir → baseline → budget PRÓPRIO deste sistema
→ gargalos → corrigir se seguro/relevante → medir antes/depois
```

Quando fizer sentido: dados sintéticos · volumes diferentes · EXPLAIN/EXPLAIN ANALYZE · warmup · múltiplas execuções · mediana/p95 · mocks de providers · concorrência local controlada.

**Falta de ferramenta ≠ N/A.** Escolher ferramenta adequada ao stack.  
Categoria aplicável sem medição suficiente ⇒ 🟡 **PARCIALMENTE VALIDADA**.

### Fluxo permanente (após implantação)

| Momento | Cobertura |
|---------|-----------|
| **PR normal** | **Reutilizar** inventário/baseline existentes; conjunto **crítico permanente** + superfícies **impactadas** pela mudança — **não** refazer inventário completo a cada PR |
| **Mudança global** (auth, router, client de dados, UI global, build, bundling, middleware) | Ampliar automaticamente |
| **Periódico / pré-release** | Sweep **mais amplo** que o Gate de PR |

Não stress test em produção sem autorização explícita.  
Budgets e thresholds: **deste** sistema — nunca copiar de outro projeto.

Se Performance for aplicável e baseline existir: o check de Performance no Gate deve estar **habilitado**. Skipped permanente **não** permite marcar Performance ✅ VALIDADA.

---

## D. Quality / Security / Performance Gate, PR, QA, periódico, mapa QSP

1. Gerar no **projeto** o mapa permanente **REAL** (não o example):
   - `docs/security/QSP-COVERAGE-MAP.md`
   - `docs/security/qsp-coverage-map.json`
2. Validar mapa (`qsp-validate-map`) — crítico automatizável sem executor = inválido.
3. Adaptar workflows V1.1 **somente**:
   - `workflows/pr-qsp-gate.example.yml` (padrão atual)
   - `workflows/periodic-qsp.example.yml`
   - Se Supabase aplicável: `workflows/periodic-supabomb.example.yml` (complementar PERIODIC — ver `stack-examples/supabase/supabomb/`)
   - **NÃO** usar `pr-quality-gate.example.yml` / `periodic-security.example.yml` (DEPRECATED, fail-closed).
4. Scripts: validate-map, impact (+ globalImpactPaths), coverage-drift (pr + full-repo), gate-aggregator.
5. Template de PR + QA + branch protection exigindo **QSP Gate**.
6. Regressões de bugs → suíte permanente + entrada no mapa.
7. Performance: cada superfície medida na implantação → ALWAYS|IMPACT|PERIODIC|HUMAN justificado (não só bundle nas PRs).
8. **Supabomb** (somente se stack Supabase): avaliar aplicabilidade e decidir `environmentStrategy`:
   - **A.** Branching disponível + autorização → `EPHEMERAL_PREVIEW` (padrão; Preview Branch efêmera via Management API; secrets `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PARENT_PROJECT_REF`; parent **não** é alvo do scan; cleanup `if: always()`).
   - **B.** Branching indisponível, staging/security-preview autorizado → `EXISTING_NON_PROD` (`SUPABOMB_PROJECT_REF` + `SUPABOMB_ANON_KEY`).
   - **C.** Nenhum dos dois → `HUMAN_SETUP_REQUIRED` (nunca PASS; **não** criar projeto pago automaticamente).
   - Produção: **proibida** como fallback automático.
   - Pin imutável + `docs/security/supabomb.config.json` + `periodic-supabomb` + self-test.
   - Sem Supabase → N/A justificado sem workflow.

### READY FOR QA

```
QSP Gate FALHOU (obrigatório / skip indevido / coverage gap / não configurado)
→ NÃO READY FOR QA → Dev
QSP Gate PASS
→ READY FOR QA
```

QSP Gate verde ≠ sistema invulnerável.  
Workflow criado ≠ Gate validado.  
Skip IMPACT só com justificativa do mapa de impacto.

### Performance permanente

- Implantação: inventário amplo.
- Classificar medições ALWAYS / IMPACT / PERIODIC.
- PR: crítico permanente + superfícies impactadas (DB/API/Edge/FE).
- Mudança global → ampliar.
- Periódico → sweep amplo.
- Não reduzir Performance futura **apenas** a bundle se a implantação mediu outras superfícies.

---

## E. Antes do primeiro push remoto

Push remoto **só** com autorização explícita (ou política do projeto). Antes disso, auditar **além** de `.github/workflows/`:

- GitHub Apps / integrations;
- Cloudflare Pages / Vercel / Netlify / equivalentes;
- Supabase Preview (ou preview DB do provider);
- webhooks;
- environments;
- outras automações do repositório.

Para cada efeito classificar:

`PRODUÇÃO` | `PREVIEW` | `CI` | `SIDE-EFFECT EXTERNO` | `NENHUM`

**Nunca** concluir: “não há deploy no workflow” ⇒ “não há efeito externo”.

Se houver risco de efeito em produção ou destrutivo: **PARAR** antes do push e explicar.

Secrets: scanners adequados + garantir que `.env` / credenciais não serão versionados.

---

## F. Laboratório de Gate (quando for provar o Gate)

- Exige autorização para push/PR/remoto conforme política acima.
- Usar branches **temporárias isoladas** — não alterar `main` / `develop` / branches reais da equipe só para prova.
- Quando permitido: **VERDE → falha deliberada controlada → VERMELHO → restauração → VERDE**.
- Sem merge. Sem limpeza automática do lab antes da revisão humana.
- Se ruleset/branch protection exigir admin/plano: registrar 🔎 — **não** tratar como falha do Gate se Quality/Security/Performance **executaram** de fato.
- Lab comprova funcionamento dos checks; **proteção real de `main`** continua ação de implantação (humana).

---

## G. Baseline e fechamento

### Critério de encerramento da implantação inicial (V1.1)

Não basta: Ficha VALIDADA + baseline + Gate utilizável + pilares verdes só na máquina local.

Exigir, **conforme aplicável**:

- Ficha **VALIDADA**;
- Security / Quality / Performance **avaliadas e evidenciadas**;
- **Mapa permanente de cobertura QSP** no projeto;
- Controles automatizáveis classificados ALWAYS / IMPACT / PERIODIC / HUMAN;
- Controles críticos no Gate; IMPACT ligado; periódico ampliado;
- Runtime Security no CI quando descartável for viável;
- Coverage drift + **QSP Gate** agregador;
- Nenhuma superfície automatizável importante ficou só como validação pontual;
- baseline **registrada**;
- riscos 🔴 tratados ou com plano;
- **AÇÕES HUMANAS RESTANTES** (inclui branch protection para enforcement real).

Usar fechamento **limitado ao escopo validado**.  
Implantação REAL ainda exige enforcement remoto da branch + HUMAN externos.

### Baseline (obrigatória)

Registrar: arquitetura; Ficha usada; inventários; riscos; correções; pendências; testes **executados**; Gate; periódico; Performance (inventário, baselines, budgets); decisões humanas; evidências.

Frase permitida: **“baseline validada dentro do escopo e controles executados.”**

### Fechamento dos pilares

Cada pilar aplicável: ✅ VALIDADA | 🟡 PARCIAL | 🔴 BLOQUEADA | ➖ N/A (justificado).  
✅ somente com execução + evidência (CONFIGURADO ≠ VALIDADO).

### Seção final obrigatória (única)

```markdown
## AÇÕES HUMANAS RESTANTES

Para cada item:
- nome
- classificação (🔎 / 🔴 / 🟡)
- o que precisa ser feito
- por que
- onde
- como validar
- se bloqueia implantação real
```

### Ações humanas tipicamente acumuladas

| Tema | Notas |
|------|-------|
| Validação da Ficha | Já feita antes da implantação; se reabrir, 🔴 até revalidar |
| Push / PR / remoto | Não autorizado automaticamente pela implantação completa |
| Branch protection / `main` | 🔎 frequentemente 🔴 para implantação real |
| Permissões admin / plano do Git | Rulesets |
| Secrets de produção | Cron, tokens, providers |
| Compliance / DPA | Sem inventar conclusão |
| Configurações externas / painéis | JWT gateway, etc. |
| Verificações read-only em produção | Contas privilegiadas, configs |
| Previews / Apps | Limpeza ou aceite |
| Merge / deploy / migrate remoto | Fluxo normal do time |
| Limpeza do laboratório | PR/branches/previews |

### Frases de encerramento

Se pilares aplicáveis fechados no escopo técnico e só restam humanos documentados:

> IMPLANTAÇÃO TÉCNICA CONCLUÍDA — padrão implantado dentro do escopo validado. Próximo passo: fluxo normal (PR → Gate → QA → aprovação → merge/deploy). Sem merge/deploy automático nesta implantação. Ver AÇÕES HUMANAS RESTANTES.

Se houver 🔴 técnico ou evidência em falta no escopo local:

> IMPLANTAÇÃO TÉCNICA — AINDA BLOQUEADA. Há item 🔴 ou evidência em falta. Não declarar implantação concluída. Ver AÇÕES HUMANAS RESTANTES.

---

## Proibições

- Alterar produção / secrets de produção sem processo explícito do time.
- Push / PR / escrita remota / merge / deploy automático sem autorização explícita.
- Inventar regra de negócio.
- Copiar thresholds/testes de outro produto.
- Parar a cada 🔎 não bloqueante.
- Exigir nova ordem entre Fase 2 e Fase 3 após “implantação completa”.
- Marcar pilar ✅ sem execução + evidência (CONFIGURADO ≠ VALIDADO).
- Marcar Performance ✅ sem inventário/cobertura das categorias aplicáveis.
- Permitir placeholder crítico com PASS / falso verde.
- Declarar segurança absoluta.

---

## Referência rápida — ordem típica pós-Ficha VALIDADA

1. Branch de implantação (se ainda não houver).
2. Aprofundar mapeamento; comparar Ficha × código; gaps.
3. Security: inventário amplo → corrigir + testar (positivo/negativo/isolamento) **executados**.
4. Quality: lint/typecheck/testes/build/secrets (quando aplicável).
5. Performance: inventário amplo → medir → baseline/budgets → classificar ALWAYS/IMPACT/PERIODIC.
6. **Gerar mapa QSP** do projeto; ligar controles ao Gate; coverage drift; QSP Gate agregador; periódico ampliado.
7. Runtime CI (Supabase/Docker/Testcontainers/…) quando viável — não só markers.
8. Se Supabase: configurar **Supabomb PERIODIC complementar** (pin + workflow GHA + config; N/A se não aplicável; INCOMPLETE sem alvo autorizado).
9. Documentar QA / branch protection.
10. Auditoria pré-push — push só se autorizado.
11. Lab de Gate se autorizado.
12. Baseline + AÇÕES HUMANAS RESTANTES + frase de encerramento.
