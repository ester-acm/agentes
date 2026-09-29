# Relatórios periódicos (template) — V1.1

Convenção sugerida: pasta **não versionada** (ex.: `security-reports/` no `.gitignore`).

## Cadência

- Workflow `periodic-qsp.example.yml` (agenda + manual) e/ou pré-release.
- Scanners **pesados** fora do Gate de toda PR.
- Quando Supabase aplicável: workflow complementar `periodic-supabomb.example.yml` (quinzenal UTC 1º/15º + `workflow_dispatch`).
  - Padrão: Preview Branch efêmera (`EPHEMERAL_PREVIEW`) — sem segundo projeto permanente.
  - Fallback: staging/security-preview; sem ambos → HUMAN_SETUP_REQUIRED.
  - Produção nunca é alvo automático. Cleanup da Preview: `if: always()`.

## Sweep = mapa QSP ampliado

O periódico deve **reutilizar** `docs/security/qsp-coverage-map.json` e executar cobertura **mais ampla** que a PR:

| Área | Incluir quando aplicável |
|------|--------------------------|
| Quality | lint / typecheck / test / build / secrets |
| Security runtime | RLS/DB, APIs/Edge, Storage, RPC, jobs |
| Dependencies | audit + triagem |
| Performance | permanente + DB/API/Edge/jobs/bundle |
| Coverage drift | varredura de superfícies do repo vs mapa |
| Supabomb (só Supabase) | última execução: data, status, pin, findings abertos; **STALE** se sem execução válida no prazo |
| HUMAN | checklist (não automatiza painéis) |

**Supabomb** é complementar — não substitui runtime QSP. Consultar resultado antigo ≠ PASS.

```
CONFIGURADO ≠ VALIDADO
```

Módulo obrigatório não adaptado → fail-closed.

## Não versionar

Tokens, dumps, PII, caches de ferramenta (`.supabomb.json`), raw reports com sample_data, `project_ref`/keys de Preview Branch.
