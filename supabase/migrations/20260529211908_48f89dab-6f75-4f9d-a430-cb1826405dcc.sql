-- 1. Garantir permissões básicas na tabela de objetos
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;

-- 2. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Products All Access" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Universal Access" ON storage.objects;
DROP POLICY IF EXISTS "Give anon and authenticated access to products" ON storage.objects;
DROP POLICY IF EXISTS "Give anon and authenticated access to campaigns" ON storage.objects;

-- 3. Criar políticas robustas que permitem TUDO para os buckets específicos
-- Usando "TO public" para cobrir anon e authenticated

CREATE POLICY "Products_Universal_Policy"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Campaigns_Universal_Policy"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- 4. Garantir que os buckets sejam públicos (caso não estejam)
UPDATE storage.buckets SET public = true WHERE id IN ('products', 'campaigns');
