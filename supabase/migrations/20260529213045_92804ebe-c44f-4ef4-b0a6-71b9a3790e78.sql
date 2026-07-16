-- 1. Garantir permissões de banco para a role anon (necessário para o Storage API)
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;

-- 2. Limpar políticas existentes que podem estar em conflito
DROP POLICY IF EXISTS "Public_Access_Campaigns_New" ON storage.objects;
DROP POLICY IF EXISTS "Public_Access_Products_New" ON storage.objects;
DROP POLICY IF EXISTS "Global_Storage_Access" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns_Universal_Policy" ON storage.objects;
DROP POLICY IF EXISTS "Products_Universal_Policy" ON storage.objects;

-- 3. Criar políticas idênticas para os dois buckets
-- Usamos FOR ALL TO public para cobrir anon e authenticated

CREATE POLICY "Products_Universal_Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Campaigns_Universal_Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- 4. Garantir acesso de leitura aos buckets
DROP POLICY IF EXISTS "Allow_Select_Buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Public Bucket Access" ON storage.buckets;

CREATE POLICY "Public_Bucket_Read"
ON storage.buckets FOR SELECT
TO public
USING (true);

-- 5. Forçar estado público
UPDATE storage.buckets SET public = true WHERE id IN ('products', 'campaigns');
