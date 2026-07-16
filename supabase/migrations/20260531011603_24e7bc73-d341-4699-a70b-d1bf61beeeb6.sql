-- Remover políticas antigas se existirem com nomes conflitantes ou apenas garantir a nova
DROP POLICY IF EXISTS "Products_Universal_Access" ON storage.objects;

-- Criar uma política abrangente para o bucket de produtos
CREATE POLICY "Public Products Access"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Garantir que os papéis tenham permissão de uso no schema storage (geralmente já têm, mas por segurança)
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON TABLE storage.objects TO anon, authenticated, service_role;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated, service_role;
