# Testes a partir da Ficha VALIDADA (V1.1)

Os testes protegem o comportamento **esperado** (Ficha), não o acaso do código atual.

```
Ficha VALIDADA
→ regra crítica
→ teste permitido (positivo)
→ teste proibido (negativo)
→ isolamento (quando aplicável)
→ IDOR / self-escalation (quando aplicável)
→ regressão PERMANENTE no mapa QSP (ALWAYS | IMPACT | PERIODIC)
```

## Princípios

1. Sem número fixo universal — cobertura conforme riscos do sistema.
2. UI não é a única prova: preferir API / backend / banco / runtime.
3. Autenticação ≠ autorização.
4. Achado confirmado → teste que falharia antes → corrigir → executar → **entrar no mapa QSP**.
5. Teste só na implantação ≠ proteção permanente.
6. Runtime quando viável no CI; markers complementam.
7. Placeholder que dá PASS em regra não testada é **proibido**.
8. Achado do **Supabomb** (quando aplicável) segue o mesmo caminho: triagem → correção → reteste → regressão QSP — não depender só do próximo ciclo quinzenal.

## Self-tests do template

```bash
node docs/security-template/scripts/run-template-selftest.example.mjs
node docs/security-template/scripts/run-supabomb-selftest.example.mjs
```

## Mínimo por regra crítica

| Tipo | Esperado |
|------|----------|
| Positivo | Autorizado consegue |
| Negativo | Sem permissão bloqueia |
| Isolamento | A ≠ B / tenant |
| IDOR | Trocar IDs não concede acesso |
| Self-escalation | Não eleva papel/escopo |
| Edge/API | Matriz sem auth / inválida / sem perm / cross / ok |
| Storage | Upload/leitura permitida×proibida; bucket flags |
| Job/cron | Fail-closed sem secret |
| Integração | Side-effect só após authz (mock no CI) |

## Onde registrar

1. Suite do projeto (`tests/`, `supabase/tests/`, etc.).
2. Entrada no **mapa QSP** (`docs/security/qsp-coverage-map.json`) com frequência e `impactPaths`.
3. Job ALWAYS ou IMPACT no `pr-qsp-gate`.

## Coverage drift

Nova tabela / policy / RPC / endpoint / Edge / bucket / job / pagamento / role / superfície de IA / categoria Performance → deve atualizar o mapa.  
Senão: **COVERAGE GAP** → QSP Gate falha.

## Módulo opcional

Supabase: [`../stack-examples/supabase/`](../stack-examples/supabase/).
