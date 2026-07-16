-- 1. Remover política global de diagnóstico
DROP POLICY IF EXISTS "Global_Storage_Access" ON storage.objects;

-- 2. Criar políticas definitivas para os buckets
-- O segredo é garantir que não haja restrições implícitas sobre o 'owner'

CREATE POLICY "Products_Public_Insert" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Products_Public_Select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'products');

CREATE POLICY "Campaigns_Public_Insert" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'campaigns');

CREATE POLICY "Campaigns_Public_Select" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'campaigns');

-- Também permitir UPDATE/DELETE para ser idêntico ao que o usuário espera de 'total'
CREATE POLICY "Products_Public_Update" ON storage.objects
FOR UPDATE TO public
USING (bucket_id = 'products');

CREATE POLICY "Campaigns_Public_Update" ON storage.objects
FOR UPDATE TO public
USING (bucket_id = 'campaigns');

CREATE POLICY "Products_Public_Delete" ON storage.objects
FOR DELETE TO public
USING (bucket_id = 'products');

CREATE POLICY "Campaigns_Public_Delete" ON storage.objects
FOR DELETE TO public
USING (bucket_id = 'campaigns');
