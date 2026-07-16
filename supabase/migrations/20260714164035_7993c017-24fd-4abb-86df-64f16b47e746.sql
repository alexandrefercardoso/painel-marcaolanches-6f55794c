-- Anexa os triggers de baixa de estoque nas tabelas de pedidos

DROP TRIGGER IF EXISTS trg_consume_stock_on_order_complete ON public.delivery_orders;
CREATE TRIGGER trg_consume_stock_on_order_complete
AFTER UPDATE OF status ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_consume_stock_on_order_complete();

DROP TRIGGER IF EXISTS trg_consume_stock_on_session_close ON public.table_sessions;
CREATE TRIGGER trg_consume_stock_on_session_close
AFTER UPDATE OF status ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.trg_consume_stock_on_session_close();