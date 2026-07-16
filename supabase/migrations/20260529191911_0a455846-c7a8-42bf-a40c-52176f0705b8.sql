-- Garantir que o bucket existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remover políticas que possam estar conflitando
DROP POLICY IF EXISTS "Public Upload Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public View Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Uploads to Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Views to Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Updates to Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Deletes to Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Allow All" ON storage.objects;

-- Criar política universal para o bucket 'campaigns'
CREATE POLICY "Universal Access Campaigns"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');