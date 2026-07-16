-- Remover políticas anteriores do bucket campaigns
DROP POLICY IF EXISTS "Campaigns Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Authenticated Delete" ON storage.objects;

-- Criar novas políticas PÚBLICAS para o bucket campaigns
CREATE POLICY "Campaigns Public Insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'campaigns');
CREATE POLICY "Campaigns Public Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'campaigns');
CREATE POLICY "Campaigns Public Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'campaigns');
CREATE POLICY "Campaigns Public Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'campaigns');

-- Remover políticas anteriores do bucket products para garantir consistência
DROP POLICY IF EXISTS "Products Insert" ON storage.objects;
DROP POLICY IF EXISTS "Products Select" ON storage.objects;
DROP POLICY IF EXISTS "Products Update" ON storage.objects;
DROP POLICY IF EXISTS "Products Delete" ON storage.objects;

-- Criar novas políticas PÚBLICAS para o bucket products
CREATE POLICY "Products Public Insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'products');
CREATE POLICY "Products Public Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'products');
CREATE POLICY "Products Public Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'products');
CREATE POLICY "Products Public Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'products');
