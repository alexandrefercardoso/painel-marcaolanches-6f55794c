-- 1. Permissões de role
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;

-- 2. Limpar políticas existentes
DROP POLICY IF EXISTS "Products_Universal_Policy" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns_Universal_Policy" ON storage.objects;

-- 3. Criar políticas super simples (para teste e correção definitiva)
-- Nota: 'TO public' aplica-se a todos os usuários (anon e auth)

CREATE POLICY "Allow_All_Products" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow_All_Campaigns" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Adicionalmente, permitir SELECT em buckets para as roles
CREATE POLICY "Allow_Select_Buckets" ON storage.buckets
FOR SELECT TO public
USING (true);
