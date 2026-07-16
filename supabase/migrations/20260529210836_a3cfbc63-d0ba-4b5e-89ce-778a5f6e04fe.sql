-- Garantir privilégios básicos de acesso à tabela de objetos para roles não-proprietárias
-- Isso é o que permite o funcionamento "sem sessão" (anon) em muitos projetos migrados
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.buckets TO anon, authenticated;

-- Garantir que as políticas sejam idênticas para ambos os buckets
DROP POLICY IF EXISTS "Products All Access" ON storage.objects;
CREATE POLICY "Products All Access" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'products') 
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Campaigns Universal Access" ON storage.objects;
CREATE POLICY "Campaigns Universal Access" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'campaigns') 
WITH CHECK (bucket_id = 'campaigns');
