# Módulo opcional — Supabase (V1.1)

Usar **somente** se o sistema tiver Supabase (Auth, Postgres, RLS, Storage, Edge).

Não faz parte do núcleo universal. O princípio universal é: **ambiente descartável viável → testar comportamento real no CI**.

## Conteúdo

| Arquivo | Uso |
|---------|-----|
| [`00_example_rls_surface.sql`](00_example_rls_surface.sql) | Exemplo pgTAP (adaptar tabelas) |
| [`01_example_storage_policies.sql`](01_example_storage_policies.sql) | Contrato storage privado/público |
| [`workflow-snippet-supabase-security.yml`](workflow-snippet-supabase-security.yml) | Job CI: start → reset → RLS/Storage/Edge → stop |
| [`edge-authz-smoke.example.md`](edge-authz-smoke.example.md) | Matriz de testes Edge |
| [`supabomb/`](supabomb/) | Scanner periódico complementar — **padrão Preview Branch efêmera** |

Alvo periódico:

- **Padrão:** Preview Branch temporária (`EPHEMERAL_PREVIEW`) — sem segundo projeto permanente.
- **Fallback:** staging/security-preview (`EXISTING_NON_PROD`).
- **Sem Branching/staging:** `HUMAN_SETUP_REQUIRED` (não criar cobrança automaticamente).
- **Produção:** nunca fallback automático.

Ver [`supabomb/README.md`](supabomb/README.md).

- Com Supabase → PERIODIC no mapa + `periodic-supabomb.example.yml` + `environmentStrategy` no config.
- Pin atual **não** testa endpoint local/custom → Preview Branch cloud ou staging.
## Pipeline CI obrigatório (quando Supabase aplicável e runtime viável)

```
supabase start
→ db reset / migrations do zero
→ seed sintético determinístico
→ testes DB reais (RLS A×B, tenant, anon, RPC, grants)
→ Storage (upload/leitura permitida×proibida, bucket flags)
→ Edge smoke/authz (mock providers)
→ stop --no-backup
```

**Markers/grep** podem **complementar**.  
**Não** podem ser a **única** prova de controle runtime crítico (RLS, Storage, Edge authz) quando o CI puder subir stack descartável.

## Frequências sugeridas no mapa QSP do projeto

| Controle | ALWAYS | IMPACT | PERIODIC |
|----------|--------|--------|----------|
| Unit authz / markers | ✓ | | ✓ |
| RLS runtime | | ✓ (migrations/tests) | ✓ amplo |
| Storage runtime | | ✓ | ✓ |
| Edge authz smoke | | ✓ (functions/**) | ✓ |
| Supabomb (complementar) | | | ✓ quinzenal GHA — NÃO substitui runtime |

## Supabomb (complementar)

Ver [`supabomb/README.md`](supabomb/README.md).

- Sem Supabase → **N/A** (não instalar workflow).
- Com Supabase → PERIODIC no mapa + `periodic-supabomb.example.yml` + `environmentStrategy`.
- **Padrão:** Preview Branch efêmera; **fallback:** staging; **nunca** produção automática.
- Pin atual **não** testa endpoint local/custom.
- Achado → regressão QSP (ALWAYS/IMPACT/PERIODIC).

## Convenção de testes no projeto

- `supabase/tests/*.sql` — isolamento, grants, RPC
- Script Node do projeto (ex. `security:local`) — usuários A×B via Auth Admin + REST
- Edge: sem auth / JWT inválido / sem permissão / outro recurso → nega; autorizado → permite; side-effect externo só após authz; **mock** Stripe/Mistral/etc.

## Cuidados

- Sem `--linked` / produção.
- Pinar versão do CLI.
- Seed CI sem meta-comandos quebrados.
- Placeholder incompleto → **fail-closed**.
- CONFIGURADO ≠ VALIDADO.
- CORS do gateway local pode diferir do `_shared/cors` — validar código + comportamento.
