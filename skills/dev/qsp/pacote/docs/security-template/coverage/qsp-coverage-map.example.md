# Mapa permanente de cobertura QSP (EXEMPLO / MODELO)

**Artefato do PROJETO** (gerado na implantação) — **não** é quarto componente do pacote.  
**NÃO** usar este example como mapa definitivo: o agente gera o JSON/MD **real** do sistema.

Caminhos no projeto:

| Artefato | Caminho |
|----------|---------|
| Mapa legível | `docs/security/QSP-COVERAGE-MAP.md` |
| Mapa CI | `docs/security/qsp-coverage-map.json` |

```
CONFIGURADO ≠ VALIDADO
teste só na implantação ≠ proteção permanente
“VALIDADO NA BASELINE” sem ALWAYS/IMPACT/PERIODIC = INCOMPLETO
```

## Frequências

| Código | Significado |
|--------|-------------|
| **ALWAYS** | Toda PR |
| **IMPACT** | Paths da superfície **ou** `globalImpactPaths` |
| **PERIODIC** | Sweep periódico / pré-release |
| **HUMAN** | Não automatizável + `humanJustification` obrigatória |

## globalImpactPaths

Auth, middleware, permissions, shared security, client de DB, router, build, bundling, infra, libs compartilhadas — definidos **pelo projeto**.  
Hit global → amplia automaticamente todos os controles IMPACT ativos (incl. Performance).

## Drift

| Modo | Uso |
|------|-----|
| `pr` | Diff × detectores |
| `full-repo` | Repo inteiro × mapa; órfãos; PERIODIC ⊆ `QSP_PERIODIC_EXECUTED_IDS` |

SUPERFÍCIE SENSÍVEL SEM COBERTURA → **COVERAGE GAP** → falha.

## Campos obrigatórios

id · pillar · surface · criticality · frequency · evidence · status  
+ command/executor se automatizável critical/high  
+ impactPaths se IMPACT  
+ humanJustification se HUMAN  

Validar com `qsp-validate-map` antes do Gate.
