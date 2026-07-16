-- Garantir que o bucket 'campaigns' seja público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'campaigns';

-- Remover qualquer política existente para começar do zero e evitar conflitos
DROP POLICY IF EXISTS "Public Upload Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public View Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload público de campanhas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública de campanhas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública de campanhas" ON storage.objects;

-- Criar política de inserção (upload) para TODOS os usuários (anon e authenticated)
CREATE POLICY "Allow All Uploads to Campaigns"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'campaigns');

-- Criar política de visualização para TODOS os usuários
CREATE POLICY "Allow All Views to Campaigns"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- Criar política de atualização para TODOS os usuários
CREATE POLICY "Allow All Updates to Campaigns"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Criar política de exclusão para TODOS os usuários (útil para limpeza)
CREATE POLICY "Allow All Deletes to Campaigns"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'campaigns');