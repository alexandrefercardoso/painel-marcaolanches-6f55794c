-- Adicionar colunas para controle de produção nos itens de mesa
ALTER TABLE public.table_order_items 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS batch_id UUID,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- Criar um índice para melhorar a performance das consultas de produção
CREATE INDEX IF NOT EXISTS idx_table_order_items_status ON public.table_order_items(status);
CREATE INDEX IF NOT EXISTS idx_table_order_items_session_id ON public.table_order_items(session_id);

-- Comentários para documentação
COMMENT ON COLUMN public.table_order_items.status IS 'Status do item: pending, preparing, ready, delivered, canceled';
COMMENT ON COLUMN public.table_order_items.batch_id IS 'ID do lote/rodada de pedidos para agrupar itens enviados juntos';
