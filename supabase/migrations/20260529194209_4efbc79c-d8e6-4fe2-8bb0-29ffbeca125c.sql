-- Habilitar leitura pública dos buckets (necessário para o storage-api validar o bucket)
DROP POLICY IF EXISTS "Public Bucket Access" ON storage.buckets;
CREATE POLICY "Public Bucket Access" ON storage.buckets FOR SELECT TO public USING (true);

-- Garantir políticas detalhadas para objetos no bucket de campanhas
DROP POLICY IF EXISTS "Campaigns Full Access" ON storage.objects;
CREATE POLICY "Campaigns Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'campaigns');
CREATE POLICY "Campaigns Insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'campaigns');
CREATE POLICY "Campaigns Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'campaigns') WITH CHECK (bucket_id = 'campaigns');
CREATE POLICY "Campaigns Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'campaigns');

-- Garantir políticas detalhadas para objetos no bucket de produtos
DROP POLICY IF EXISTS "Products Full Access" ON storage.objects;
CREATE POLICY "Products Select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'products');
CREATE POLICY "Products Insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'products');
CREATE POLICY "Products Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'products') WITH CHECK (bucket_id = 'products');
CREATE POLICY "Products Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'products');
