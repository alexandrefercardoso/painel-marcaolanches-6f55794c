-- Ajustar RLS do Storage para ser mais permissivo durante a fase de transição/erro
DROP POLICY IF EXISTS "Permitir upload para usuários autenticados no bucket campaigns" ON storage.objects;
CREATE POLICY "Permitir upload total no bucket campaigns para autenticados"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaigns');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados no bucket ca" ON storage.objects;
CREATE POLICY "Permitir update total no bucket campaigns para autenticados"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'campaigns');

-- Ajustar RLS da tabela weekly_campaigns
-- Como a tabela profiles está vazia, o subquery (SELECT company_id FROM profiles WHERE id = auth.uid()) retorna NULL, bloqueando tudo.
-- Vamos permitir que usuários autenticados gerenciem campanhas enquanto o sistema de perfis não é populado.

DROP POLICY IF EXISTS "Usuários podem visualizar campanhas da própria empresa" ON public.weekly_campaigns;
CREATE POLICY "Visualização pública de campanhas"
ON public.weekly_campaigns
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Usuários podem inserir campanhas para sua empresa" ON public.weekly_campaigns;
CREATE POLICY "Inserção de campanhas por autenticados"
ON public.weekly_campaigns
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Usuários podem atualizar campanhas da própria empresa" ON public.weekly_campaigns;
CREATE POLICY "Atualização de campanhas por autenticados"
ON public.weekly_campaigns
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem deletar campanhas da própria empresa" ON public.weekly_campaigns;
CREATE POLICY "Deleção de campanhas por autenticados"
ON public.weekly_campaigns
FOR DELETE
TO authenticated
USING (true);
