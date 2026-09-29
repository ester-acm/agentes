-- Exemplo: contrato de Storage (adaptar bucket IDs do projeto).
-- Rodar no CI ephemeral após migrations.
-- NÃO usar pass() em regra não testada.

BEGIN;

DO $$
DECLARE
  b record;
BEGIN
  -- Exemplo: bucket sensível deve ser privado
  -- SUBSTITUIR 'generated-images' pelo id real do projeto
  SELECT id, public INTO b FROM storage.buckets WHERE id = 'generated-images';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'NÃO CONFIGURADO / INCOMPLETO: bucket generated-images ausente (adaptar teste)';
  END IF;
  IF b.public IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Bucket generated-images deve ser public=false, got %', b.public;
  END IF;
  RAISE NOTICE 'storage bucket private OK';
END $$;

-- TODO (projeto): policies de select/insert/delete por pasta=uid;
-- TODO: root moderation policy se Ficha exigir;
-- TODO: testes REST upload/leitura cross-user no script Node.

ROLLBACK;
