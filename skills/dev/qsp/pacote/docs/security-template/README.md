# Template Técnico — Segurança, Qualidade e Validação

**Pacote V1.1** — implantação ampla **e** proteção permanente das próximas alterações.

Pacote **reutilizável** de implementação técnica do processo da empresa.

## Arquitetura oficial (3 componentes operacionais)

| Documento | Função |
|-----------|--------|
| **1. POP** | Define **COMO** o processo funciona |
| **2. Ficha de Conhecimento e Segurança** | Define **COMO** aquele sistema **DEVE** funcionar |
| **3. Template Técnico** (esta pasta + Prompt Mestre e artefatos internos) | Estrutura técnica: workflows, scripts, testes, PR, QA, scans e automações |

**Prompt Mestre** = orientação de execução (não é quarto componente).  
**Mapa QSP** = artefato **gerado no projeto** na implantação (`docs/security/qsp-coverage-map.*`) — também **não** é quarto componente do pacote.

## V1.1 — proteção permanente

```
Controle aplicável + validado + automatizável
→ ALWAYS | IMPACT | PERIODIC
(HUMAN só se não automatizável)
```

| Frequência | Quando roda |
|------------|-------------|
| **ALWAYS** | Toda PR |
| **IMPACT** | PR que toca a superfície **ou** `globalImpactPaths` |
| **PERIODIC** | Sweep periódico / pré-release (mais amplo) |
| **HUMAN** | Painéis, DPA, branch protection enforcement, etc. |

**QSP Gate** = check agregador obrigatório (falha em skip indevido / gap / falha).  
Verde ≠ zero bugs.

**Coverage drift** = nova superfície sensível sem mapa → GAP → NÃO READY FOR QA.

**Runtime no CI** quando descartável for viável (Supabase/Docker/Testcontainers/…). Markers complementam.

## Regra de evidência

```
CONFIGURADO ≠ VALIDADO
```

## Fluxo assistido (inalterado para o humano)

```
Fase 1 → Ficha EM VALIDAÇÃO → HARD STOP
Humano valida Ficha (VALIDADA)
→ “A Ficha está VALIDADA. Execute a implantação completa.”
→ agente faz implantação + automação permanente + QSP Gate + periódico + mapa + baseline
→ AÇÕES HUMANAS RESTANTES
```

## Quick start

1. Copiar `docs/` de `PACOTE-UNIVERSAL-SEGURANCA/` para o projeto.
2. Cursor: **Execute a Fase 1** conforme Prompt Mestre.
3. Humano: Ficha **VALIDADA**.
4. **A Ficha está VALIDADA. Execute a implantação completa.**
5. Revisar AÇÕES HUMANAS (branch protection / remoto).

## Conteúdo desta pasta

| Item | Uso |
|------|-----|
| [`PROMPT-MESTRE-IMPLANTACAO.md`](PROMPT-MESTRE-IMPLANTACAO.md) | Execução assistida V1.1 |
| [`coverage/`](coverage/) | Modelo do mapa QSP (MD + JSON) — **não** é o mapa definitivo |
| [`fixtures/qsp/`](fixtures/qsp/) | Fixtures do self-test do template |
| [`scripts/run-template-selftest.example.mjs`](scripts/run-template-selftest.example.mjs) | Prova A–H do pacote |
| [`scripts/qsp-*.example.mjs`](scripts/) | validate-map, impact+global, drift pr/full-repo, gate |
| [`workflows/pr-qsp-gate.example.yml`](workflows/pr-qsp-gate.example.yml) | **Padrão V1.1** ALWAYS+IMPACT+QSP Gate |
| [`workflows/periodic-qsp.example.yml`](workflows/periodic-qsp.example.yml) | **Padrão V1.1** sweep + full-repo drift |
| [`workflows/periodic-supabomb.example.yml`](workflows/periodic-supabomb.example.yml) | Scanner complementar Supabase (quinzenal GHA) — só se aplicável |
| [`pull_request_template.md`](pull_request_template.md) | Impacto + coverage |
| [`qa-feature-validation.md`](qa-feature-validation.md) | QA por impacto |
| [`branch-protection.md`](branch-protection.md) | Exigir **QSP Gate** |
| [`periodic-reports.md`](periodic-reports.md) | Relatórios periódicos (+ stale Supabomb) |
| [`tests/`](tests/) | Testes a partir da Ficha + regressão permanente |
| [`stack-examples/supabase/`](stack-examples/supabase/) | Runtime CI opcional + [`supabomb/`](stack-examples/supabase/supabomb/) |

## Universalidade (dry-run conceitual)

| Stack | Mapa / runtime |
|-------|----------------|
| React + Supabase | Módulo supabase opcional; RLS/Storage/Edge ephemeral; Supabomb PERIODIC se alvo NÃO produtivo autorizado |
| Next/Node + PostgreSQL | Testcontainers/Compose; IMPACT em migrations/API; Supabomb **N/A** |
| Python API sem FE | Quality=pytest/ruff; sem bundle FE (N/A justificado); Supabomb **N/A** |
| FE + API externa sem DB próprio | Sem RLS N/A; IMPACT em client HTTP/auth shared; mocks; Supabomb **N/A** |

Ferramentas variam; modelo QSP (mapa + ALWAYS/IMPACT/PERIODIC/HUMAN + Gate) permanece. Supabomb é extensão PERIODIC complementar **somente** Supabase.

## Self-test do template

```bash
node PACOTE-UNIVERSAL-SEGURANCA/docs/security-template/scripts/run-template-selftest.example.mjs
node PACOTE-UNIVERSAL-SEGURANCA/docs/security-template/scripts/run-supabomb-selftest.example.mjs
```

## O que não fazer

- Usar o **example** como mapa definitivo do projeto.
- Deixar controle automatizável só na baseline.
- Substituir runtime crítico só por marker quando CI puder subir stack.
- Escolher workflows DEPRECATED.
- Falso verde / placeholder PASS.
- Prometer zero bugs.
- Tornar Supabase obrigatório.
- Exigir Supabomb em projeto sem Supabase.
- Usar `main`/`latest` do Supabomb sem pin.
- Declarar PASS sem alvo autorizado / sem execução.
