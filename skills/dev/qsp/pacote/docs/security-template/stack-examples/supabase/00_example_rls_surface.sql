-- Exemplo GENÉRICO — adaptar nomes de tabelas/funções ao produto.
-- Não executar como está sem revisão.
-- Regra incompleta NÃO pode PASS (evitar falso positivo).
BEGIN;
SELECT plan(3);

SELECT ok(
  NOT has_table_privilege('anon', 'public.app_items', 'SELECT'),
  'anon cannot SELECT app_items'
);

SELECT ok(
  NOT has_table_privilege('authenticated', 'public.audit_events', 'DELETE'),
  'authenticated cannot DELETE audit_events'
);

-- Isolamento User A / User B (ou tenant): INCOMPLETO até adaptar ao produto.
-- fail explícito — nunca SELECT pass() para regra não testada.
SELECT fail(
  'NÃO CONFIGURADO / INCOMPLETO: implementar isolamento (User A ≠ User B ou tenant) com JWT claims antes de contar este cenário'
);

SELECT * FROM finish();
ROLLBACK;
