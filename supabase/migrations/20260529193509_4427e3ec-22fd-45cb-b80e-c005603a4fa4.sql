-- Limpar políticas existentes para o bucket campaigns e products
DROP POLICY IF EXISTS "Public Full Access" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Full Access" ON storage.objects;
DROP POLICY IF EXISTS "Products Full Access" ON storage.objects;
DROP POLICY IF EXISTS "Universal Access Campaigns New" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1" ON storage.objects;

-- Criar política de ACESSO TOTAL para o bucket CAMPAIGNS
CREATE POLICY "Campaigns Full Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Criar política de ACESSO TOTAL para o bucket PRODUCTS
CREATE POLICY "Products Full Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Garantir que os buckets existam e sejam públicos
-- Usando a tabela storage.buckets que normalmente permite inserção via dashboard/API, 
-- mas aqui tentamos via SQL se permitido.
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true), ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;
