# Edge / server functions — matriz de testes (EXEMPLO)

Para cada function com auth / authz / tenant / recurso / side-effect / credencial admin:

| Caso | Esperado |
|------|----------|
| Sem auth | Nega (401/403) |
| Auth inválida | Nega |
| Auth válida sem permissão | Nega |
| Outro tenant / recurso | Nega |
| Autorizado | Permite |
| Side-effect externo (Stripe, e-mail, IA…) | Somente **depois** da authz; em CI usar **mock** |

## CI

- Ambiente descartável (Supabase local / functions serve / container).
- Sem secrets de produção.
- Mock de providers: resposta fake ou ausência de key → fail-closed previsível (não crash opaco).
- Registrar no mapa QSP: surface `edge-authz`, frequency IMPACT (+ PERIODIC).

## Não basta

- Só “Verify JWT” no gateway.
- Só grepar `isRootUser` no código sem executar a function.
