## Summary

<!-- 1–3 bullets: o que mudou e por quê -->

## Impacto da feature

Marque o que esta PR alterou:

- [ ] Interface / visual
- [ ] Regra de negócio
- [ ] Autenticação
- [ ] Roles / permissions
- [ ] Banco / schema / migrations
- [ ] RLS / policies
- [ ] API / backend / RPC
- [ ] Edge / server functions
- [ ] Storage / uploads
- [ ] Secrets / configuração / env
- [ ] Pagamentos
- [ ] IA
- [ ] LGPD / dados pessoais
- [ ] Jobs / crons / background
- [ ] Integrações externas / webhooks
- [ ] Performance (FE / API / DB / Edge / jobs)
- [ ] Infraestrutura / CI / deploy
- [ ] Mapa QSP / novos controles
- [ ] Nenhuma das anteriores

## Coverage QSP

- [ ] Se introduzi superfície sensível nova, atualizei `docs/security/qsp-coverage-map.json` (+ testes)
- [ ] Sem COVERAGE GAP conhecido

## Validação do desenvolvedor

- [ ] Fluxo principal + erros relevantes
- [ ] Teste automatizado / regressão quando alterei regra crítica
- [ ] Segurança não ficou só no frontend
- [ ] Sem secret privado no client
- [ ] Migration versionada se houve schema

**Riscos para o QA:**

<!-- 1–3 linhas -->

## Docs

- [ ] Ficha atualizada se o comportamento esperado mudou
- [ ] Exceção de negócio registrada se intencional

## QSP Gate → READY FOR QA

- [ ] **QSP Gate** PASS (agregador — ALWAYS + IMPACT exigidos + coverage drift)
- [ ] Só então pedir QA

Skip IMPACT só é OK se o mapa de impacto justificar.  
QSP Gate verde ≠ sistema invulnerável. Configurado ≠ validado.
