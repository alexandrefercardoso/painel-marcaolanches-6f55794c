-- 1. Limpeza total de políticas em storage.objects
DROP POLICY IF EXISTS "Campaigns_Public_Delete" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns_Public_Insert" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns_Public_Select" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns_Public_Update" ON storage.objects;
DROP POLICY IF EXISTS "Products_Public_Delete" ON storage.objects;
DROP POLICY IF EXISTS "Products_Public_Insert" ON storage.objects;
DROP POLICY IF EXISTS "Products_Public_Select" ON storage.objects;
DROP POLICY IF EXISTS "Products_Public_Update" ON storage.objects;

-- 2. Criar políticas unificadas 'FOR ALL'
-- O PostgREST às vezes exige que a política cubra ALL para certas operações complexas de upload
CREATE POLICY "Public_Access_Products" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Public_Access_Campaigns" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- 3. Garantir que as roles anon e authenticated tenham acesso à tabela
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- 4. Forçar buckets para público
UPDATE storage.buckets SET public = true WHERE id IN ('products', 'campaigns');
