-- 1. Garantir RLS habilitado
ALTER TABLE public.weekly_campaigns ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas excessivamente permissivas
DROP POLICY IF EXISTS "Enable all for everyone on weekly_campaigns" ON public.weekly_campaigns;

-- 3. Criar novas políticas baseadas em company_id para a tabela weekly_campaigns
CREATE POLICY "Usuários podem visualizar campanhas da própria empresa"
ON public.weekly_campaigns
FOR SELECT
TO authenticated
USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Usuários podem inserir campanhas para sua empresa"
ON public.weekly_campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Usuários podem atualizar campanhas da própria empresa"
ON public.weekly_campaigns
FOR UPDATE
TO authenticated
USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Usuários podem deletar campanhas da própria empresa"
ON public.weekly_campaigns
FOR DELETE
TO authenticated
USING (
  company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- 4. Garantir permissões de acesso ao bucket de storage
-- SELECT público para campanhas (já que são banners para clientes)
CREATE POLICY "Campanhas são visíveis publicamente"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- Políticas de escrita no storage limitadas pela estrutura de pastas (empresa_id/)
-- Removendo políticas genéricas anteriores se existirem
DROP POLICY IF EXISTS "Campaigns Insert" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Update" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Delete" ON storage.objects;
DROP POLICY IF EXISTS "Campaigns Select" ON storage.objects;

CREATE POLICY "Usuários podem fazer upload para a pasta de sua empresa"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'campaigns' AND
  (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Usuários podem atualizar arquivos da sua empresa"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'campaigns' AND
  (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Usuários podem deletar arquivos da sua empresa"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'campaigns' AND
  (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);

-- 5. Conceder permissões necessárias às tabelas
GRANT ALL ON public.weekly_campaigns TO authenticated;
GRANT ALL ON public.weekly_campaigns TO service_role;
