# Supabomb — scanner periódico complementar (Supabase)



**Papel:** auditoria complementar PERIODIC. **Não** substitui QSP (RLS runtime, A×B, Storage, Edge authz, Coverage Drift, Gate, Quality, Performance).



```

CONFIGURADO ≠ VALIDADO

```



## PADRÃO CORPORATIVO DE AMBIENTE



| Prioridade | Estratégia | Quando |

|------------|------------|--------|

| **1 (padrão)** | `EPHEMERAL_PREVIEW` | Branching disponível + token Management + parent ref |

| **2** | `EXISTING_NON_PROD` | Staging/security-preview já autorizado |

| **3** | `HUMAN_SETUP_REQUIRED` | Sem Branching e sem staging — **não** criar projeto pago automaticamente |

| **Proibido** | Produção como alvo | Nunca fallback automático |



**Não** criar/manter um segundo projeto Supabase permanente só para o Supabomb.



Registrar no mapa QSP / config: `environmentStrategy: EPHEMERAL_PREVIEW | EXISTING_NON_PROD | HUMAN_SETUP_REQUIRED`.



## Pin imutável



Ver [`SUPABOMB-PIN.json`](./SUPABOMB-PIN.json).



| Campo | Valor |

|-------|--------|

| Origem | https://github.com/ModernPentest/supabomb |

| Commit | `3ccc6befa598ea015f48d3e3563d0f9ac417a4f6` |

| Versão package | `0.1.0` |

| Python | `>=3.13` + `uv` |



**NÃO** usar `main`/`latest` flutuante no CI.



## Preview Branch efêmera (padrão)



```

schedule / workflow_dispatch

  → preflight (estratégia)

  → create Preview Branch (qsp-supabomb-<run_id>, with_data=false)

  → wait healthy (polling + timeout)

  → get project_ref DA BRANCH + anon legacy

  → supabomb test (alvo = branch, NÃO parent/produção)

  → sanitize / summary / artifact

  → cleanup ALWAYS (if: always())

  → compose status (scan ⊕ cleanup)

```



- Parent (`SUPABASE_PARENT_PROJECT_REF`) **só** cria a branch — **não** é alvo do scan.

- `with_data=false` — não clonar dados produtivos.

- Seed: somente sintético/controlado; se o seed do repo tiver dados reais → não executar cegamente.

- Cleanup registra duração; falha de cleanup → **INCOMPLETE** com `orphan_risk` (workflow não fica verde).



### APIs oficiais usadas



Management API (`https://api.supabase.com`):



- `POST /v1/projects/{parent}/branches`

- `GET /v1/branches/{branch_id_or_ref}` (poll até `ACTIVE_HEALTHY`)

- `GET /v1/projects/{branch_ref}/api-keys?reveal=true`

- `DELETE /v1/branches/{branch_id_or_ref}`



CLI equivalente (`supabase branches create|get|delete`, `projects api-keys`) é alternativa; o template padroniza Management API por permissões documentadas.



### Secrets persistentes (EPHEMERAL_PREVIEW)



| Secret | Papel |

|--------|--------|

| `SUPABASE_ACCESS_TOKEN` | Token Management (preferir fine-grained) |

| `SUPABASE_PARENT_PROJECT_REF` | Ref do projeto **parent** (não escaneado) |



**Não** manter `SUPABOMB_PROJECT_REF` / `SUPABOMB_ANON_KEY` permanentes neste modo — vêm da Preview e morrem com ela.



Permissões fine-grained mínimas recomendadas:



- `branching_development_create`

- `branching_development_read`

- `branching_development_delete`

- `api_gateway_keys_read`



> PAT clássico é all-or-nothing; preferir fine-grained/OAuth quando a org permitir.



### Chaves



Supabomb pinado espera **anon JWT legacy**.  

Se a Preview só tiver publishable (`sb_publishable_…`) sem anon → **INCOMPLETE** + limitação registrada.  

**Nunca** substituir por `service_role` / secret.



## Fallback EXISTING_NON_PROD



Secrets: `SUPABOMB_PROJECT_REF` + `SUPABOMB_ANON_KEY` de staging/security-preview autorizado.  

Sem cleanup de branch. Produção proibida.



## Status final



| Scan | Cleanup | Final |

|------|---------|-------|

| PASS | PASS / N/A | PASS |

| FAIL (findings) | PASS / N/A | FAIL |

| INCOMPLETE/crash | PASS / N/A | INCOMPLETE |

| qualquer | FAIL | INCOMPLETE (`CLEANUP_FAIL`, orphan risk) |



Nunca: scanner falhou + branch apagou = PASS.



## Validação técnica (código pinado)



| Capacidade | Status |

|------------|--------|

| RLS (anon acessível) | Sim |

| Anon × authenticated | Sim |

| RPC / Storage / Edge JWT | Sim |

| Relatório JSON | Sim |

| Exit code por finding | **Não** — wrapper avalia JSON |

| Endpoint local/custom | **Não** |

| Cache `.supabomb.json` | **Nunca** artifact |



## Finding → regressão QSP



```

Supabomb encontrou problema real

  → triagem → correção → reteste

  → regressão automática própria (sempre que possível)

  → ajustar mapa QSP (ALWAYS|IMPACT|PERIODIC)

```



## Stale



Sem execução **válida** em `staleAfterDays` (default 22) → STALE/INCOMPLETE.  

Válida = scan PASS|FAIL **e** cleanup tratado quando `cleanupRequired`.  

Workflow existir ≠ workflow executado.



## Self-test do template



```bash

node docs/security-template/scripts/run-supabomb-selftest.example.mjs

```



Provas A–H (preview mock, fail+cleanup, crash+cleanup, cleanup fail, fallback staging, HUMAN_SETUP, anti-produção, evidências sem ref/key).


