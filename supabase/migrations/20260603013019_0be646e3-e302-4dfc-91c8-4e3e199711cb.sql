-- Adicionar cashier_session_id à tabela table_sessions
ALTER TABLE public.table_sessions ADD COLUMN cashier_session_id UUID REFERENCES public.cashier_sessions(id);

-- Adicionar cashier_session_id à tabela delivery_orders
ALTER TABLE public.delivery_orders ADD COLUMN cashier_session_id UUID REFERENCES public.cashier_sessions(id);

-- Garantir que as permissões estejam corretas
GRANT ALL ON public.table_sessions TO authenticated;
GRANT ALL ON public.table_sessions TO service_role;
GRANT ALL ON public.delivery_orders TO authenticated;
GRANT ALL ON public.delivery_orders TO service_role;
