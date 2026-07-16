-- Garantir que a tabela não existe antes de criar
DROP TABLE IF EXISTS public.product_complement_groups CASCADE;

-- Criar a tabela
CREATE TABLE public.product_complement_groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.complement_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, group_id)
);

-- Conceder permissões explícitas (CRÍTICO para PostgREST)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_complement_groups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_complement_groups TO authenticated;
GRANT ALL ON public.product_complement_groups TO service_role;

-- Habilitar RLS
ALTER TABLE public.product_complement_groups ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir leitura pública" 
ON public.product_complement_groups FOR SELECT 
USING (true);

CREATE POLICY "Permitir tudo para usuários autenticados" 
ON public.product_complement_groups FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_complement_groups_updated_at
BEFORE UPDATE ON public.product_complement_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comando para forçar atualização do cache do PostgREST
NOTIFY pgrst, 'reload schema';