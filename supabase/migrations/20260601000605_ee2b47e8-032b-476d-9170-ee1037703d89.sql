-- Ativar Realtime para as tabelas de pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_order_items;

-- Garantir que todos os dados sejam enviados nos eventos de atualização
ALTER TABLE public.delivery_orders REPLICA IDENTITY FULL;
ALTER TABLE public.delivery_order_items REPLICA IDENTITY FULL;