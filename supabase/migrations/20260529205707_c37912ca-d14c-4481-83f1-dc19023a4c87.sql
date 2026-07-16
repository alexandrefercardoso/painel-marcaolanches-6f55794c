-- Conceder permissões básicas para as roles do Supabase
GRANT ALL ON TABLE storage.objects TO anon, authenticated;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated;

-- Simplificar políticas do bucket 'campaigns'
DROP POLICY IF EXISTS "Campaigns Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns All" ON storage.objects;

CREATE POLICY "Campaigns All Access" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'campaigns') 
WITH CHECK (bucket_id = 'campaigns');

-- Simplificar políticas do bucket 'products'
DROP POLICY IF EXISTS "Products Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Products Public Select" ON storage.objects;
DROP POLICY IF EXISTS "Products Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Products Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Products All" ON storage.objects;

CREATE POLICY "Products All Access" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'products') 
WITH CHECK (bucket_id = 'products');
