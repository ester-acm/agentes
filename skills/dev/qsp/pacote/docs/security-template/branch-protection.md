# Proteção da branch principal (checklist humano) — V1.1

Aplicar no provedor Git com permissão administrativa.  
Isto é **HUMAN/EXTERNAL** — a implantação completa **não** configura ruleset remoto sozinha.

## Antes

- [ ] Admin / plano permite branch protection
- [ ] Workflows QSP já rodaram ao menos uma vez (nomes reais dos checks)
- [ ] Mapa `docs/security/qsp-coverage-map.json` existe no default branch

## Regras recomendadas

- [ ] PR obrigatória antes do merge
- [ ] ≥ 1 aprovação; dismiss stale; conversas resolvidas
- [ ] **Required status check = `QSP Gate`** (job agregador)
  - Opcionalmente também Quality / Security ALWAYS / Performance ALWAYS se o time quiser granularidade
- [ ] Sem bypass das regras (recomendado)
- [ ] Bloquear force push e deletion da branch principal

## Importante

Sem exigir o **QSP Gate** (ou equivalentes obrigatórios):

> o pacote pode estar tecnicamente configurado, mas a proteção de merge permanece **INCOMPLETA**.

Registrar como 🔎 🔴 para implantação real quando aplicável.

Lab isolado (verde→vermelho→verde) **não** substitui protection de `main`.
