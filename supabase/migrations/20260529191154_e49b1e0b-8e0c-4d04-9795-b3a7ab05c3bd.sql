-- Garantir que o bucket 'campaigns' seja público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'campaigns';

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Permitir upload público de campanhas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública de campanhas" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização pública de campanhas" ON storage.objects;

-- Criar política de inserção (upload) para o bucket 'campaigns'
CREATE POLICY "Public Upload Campaigns"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'campaigns');

-- Criar política de visualização (leitura) para o bucket 'campaigns'
CREATE POLICY "Public View Campaigns"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaigns');

-- Criar política de atualização para o bucket 'campaigns' (necessário para o upsert)
CREATE POLICY "Public Update Campaigns"
ON storage.objects FOR UPDATE
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');