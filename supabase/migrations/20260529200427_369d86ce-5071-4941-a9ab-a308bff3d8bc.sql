-- Remover as políticas restritivas que podem estar falhando por falta de dados na tabela profiles
DROP POLICY IF EXISTS "Usuários podem fazer upload para a pasta de sua empresa" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar arquivos da sua empresa" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar arquivos da sua empresa" ON storage.objects;

-- Criar políticas mais permissivas (temporariamente) para usuários autenticados no bucket campaigns
CREATE POLICY "Permitir upload para usuários autenticados no bucket campaigns"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaigns');

CREATE POLICY "Permitir atualização para usuários autenticados no bucket campaigns"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'campaigns');

CREATE POLICY "Permitir exclusão para usuários autenticados no bucket campaigns"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'campaigns');
