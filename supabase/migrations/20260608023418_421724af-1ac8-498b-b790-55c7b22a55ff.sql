-- 1. Limpar itens de pedidos (Filhos)
DELETE FROM public.table_order_items;
DELETE FROM public.delivery_order_items;

-- 2. Limpar pedidos e sessões (Pais)
DELETE FROM public.table_sessions;
DELETE FROM public.delivery_orders;

-- 3. Limpar financeiro e caixa
DELETE FROM public.financial_transactions;
DELETE FROM public.cashier_sessions;
DELETE FROM public.customer_ledgers;
DELETE FROM public.driver_trips;

-- 4. Limpar logs e impressão (opcional)
DELETE FROM public.print_jobs;
DELETE FROM public.printing_jobs;
