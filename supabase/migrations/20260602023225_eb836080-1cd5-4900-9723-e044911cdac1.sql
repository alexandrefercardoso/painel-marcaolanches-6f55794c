-- Adicionar coluna updated_at na tabela table_order_items
ALTER TABLE public.table_order_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar gatilho para atualização automática da coluna updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_table_order_items_updated_at') THEN
        CREATE TRIGGER update_table_order_items_updated_at
        BEFORE UPDATE ON public.table_order_items
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
