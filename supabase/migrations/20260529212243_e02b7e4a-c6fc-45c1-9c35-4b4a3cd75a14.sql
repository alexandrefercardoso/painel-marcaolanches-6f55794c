-- 1. Limpeza
DROP POLICY IF EXISTS "Public_Access_Products" ON storage.objects;
DROP POLICY IF EXISTS "Public_Access_Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Global_Storage_Access" ON storage.objects;

-- 2. Políticas usando sintaxe padrão que funciona com anon
CREATE POLICY "Public_Access_Products_New" ON storage.objects
FOR ALL TO anon, authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public_Access_Campaigns_New" ON storage.objects
FOR ALL TO anon, authenticated
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- 3. Grants explícitos
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- 4. Buckets públicos
UPDATE storage.buckets SET public = true WHERE id IN ('products', 'campaigns');
