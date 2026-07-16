-- Se a tabela existir mas estiver com problemas de cache, vamos recriá-la
DROP TABLE IF EXISTS public.product_complement_groups CASCADE;

CREATE TABLE public.product_complement_groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.complement_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, group_id)
);

-- Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_complement_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_complement_groups TO anon;
GRANT ALL ON public.product_complement_groups TO service_role;

-- RLS
ALTER TABLE public.product_complement_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público para leitura" ON public.product_complement_groups FOR SELECT USING (true);
CREATE POLICY "Acesso total para autenticados" ON public.product_complement_groups FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE TRIGGER update_product_complement_groups_updated_at
BEFORE UPDATE ON public.product_complement_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Forçar o PostgREST a recarregar o schema
NOTIFY pgrst, 'reload schema';