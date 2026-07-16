-- Remover políticas anteriores para evitar conflitos
DROP POLICY IF EXISTS "Campaigns Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Authenticated Delete" ON storage.objects;

-- Política de INSERT: Permite se o usuário estiver autenticado.
-- Para isolamento multiempresa via path (company_id/arquivo):
CREATE POLICY "Campaigns Authenticated Insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaigns' AND 
  (storage.foldername(name))[1] IS NOT NULL
);

-- Política de SELECT: Pública para visualização dos banners
CREATE POLICY "Campaigns Public Select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- Política de UPDATE: Apenas usuários autenticados
CREATE POLICY "Campaigns Authenticated Update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Política de DELETE: Apenas usuários autenticados
CREATE POLICY "Campaigns Authenticated Delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'campaigns');
