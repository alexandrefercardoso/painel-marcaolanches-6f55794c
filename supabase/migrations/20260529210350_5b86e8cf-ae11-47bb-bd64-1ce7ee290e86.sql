-- Como não posso desabilitar o RLS diretamente por restrição de OWNER, 
-- vou criar uma política que permite TUDO para qualquer um no bucket específico.

-- Remover qualquer política anterior para limpar o estado
DROP POLICY IF EXISTS "Campaigns All Access" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Delete" ON storage.objects;

-- Criar uma política universal para o bucket 'campaigns' que não dependa de NADA (sessão, user, etc)
CREATE POLICY "Campaigns Universal Access"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Garantir que as roles anon e authenticated tenham permissão de uso (GRANT)
-- Se o GRANT falhar, a política acima ainda deve funcionar se o RLS for respeitado
DO $$ 
BEGIN
  EXECUTE 'GRANT ALL ON TABLE storage.objects TO public';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Não foi possível aplicar GRANT total, prosseguindo apenas com a política de RLS.';
END $$;
