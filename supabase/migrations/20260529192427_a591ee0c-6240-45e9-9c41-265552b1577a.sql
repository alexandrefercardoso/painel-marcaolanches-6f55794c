-- Garantir bucket existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Limpeza total de políticas de objetos para o bucket 'campaigns'
DO $$ 
BEGIN 
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', ' ')
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    );
END $$;

-- Criar UMA ÚNICA política simplificada e total para o bucket 'campaigns'
CREATE POLICY "Public Full Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'campaigns')
WITH CHECK (bucket_id = 'campaigns');

-- Garantir permissões de nível de banco de dados
GRANT ALL ON storage.objects TO anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO anon, authenticated, service_role;