-- 1. Remover políticas específicas
DROP POLICY IF EXISTS "Allow_All_Products" ON storage.objects;
DROP POLICY IF EXISTS "Allow_All_Campaigns" ON storage.objects;

-- 2. Criar uma política GLOBAL que permite tudo para qualquer bucket
-- Se isso falhar, o problema não é o filtro de bucket_id
CREATE POLICY "Global_Storage_Access" ON storage.objects
FOR ALL TO public
USING (true)
WITH CHECK (true);

-- 3. Garantir grants redundantes
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO anon;
GRANT ALL ON storage.buckets TO authenticated;
