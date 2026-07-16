-- 1. Garantir que as roles tenham permissões nas tabelas do storage
GRANT ALL ON TABLE storage.objects TO anon, authenticated, service_role;
GRANT ALL ON TABLE storage.buckets TO anon, authenticated, service_role;

-- 2. Recriar a política do bucket campaigns de forma ultra-permissiva para teste
-- Polcmd '*' significa ALL (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Campaigns All Access" ON storage.objects;

CREATE POLICY "Campaigns All Access" 
ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'campaigns') 
WITH CHECK (bucket_id = 'campaigns');

-- 3. Forçar o bucket para público se não estiver (embora já devesse estar)
UPDATE storage.buckets SET public = true WHERE id = 'campaigns';
