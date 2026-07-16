-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir upload total no bucket campaigns para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update total no bucket campaigns para autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados no bucket campai" ON storage.objects;
DROP POLICY IF EXISTS "Campanhas são visíveis publicamente" ON storage.objects;

-- Política de INSERT para usuários autenticados
CREATE POLICY "Campaigns Authenticated Insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaigns');

-- Política de SELECT pública (já que o bucket é marcado como público, mas por segurança reforçamos)
CREATE POLICY "Campaigns Public Select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- Política de UPDATE para usuários autenticados
CREATE POLICY "Campaigns Authenticated Update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'campaigns');

-- Política de DELETE para usuários autenticados
CREATE POLICY "Campaigns Authenticated Delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'campaigns');

-- Garantir permissões de uso do bucket (embora geralmente já existam)
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
