-- Garantir que os buckets necessários existam e sejam públicos
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('products', 'products', true),
  ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpar todas as políticas existentes para esses buckets para evitar conflitos
DROP POLICY IF EXISTS "Universal Access Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public View Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Uploads to Campaigns" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to products" ON storage.objects;

-- Criar política universal de acesso para o bucket de PRODUTOS
CREATE POLICY "Universal Access Products"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Criar política universal de acesso para o bucket de CAMPANHAS
CREATE POLICY "Universal Access Campaigns New"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Garantir que os papéis do banco tenham permissão na tabela de objetos
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;