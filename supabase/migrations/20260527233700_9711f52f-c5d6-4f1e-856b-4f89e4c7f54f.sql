-- Primeiro, vamos garantir que a restrição em printing_jobs tenha ON DELETE CASCADE
ALTER TABLE public.printing_jobs 
DROP CONSTRAINT IF EXISTS printing_jobs_order_id_fkey;

ALTER TABLE public.printing_jobs
ADD CONSTRAINT printing_jobs_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.delivery_orders(id) 
ON DELETE CASCADE;

-- Também garantir que os itens do pedido sejam excluídos em cascata
ALTER TABLE public.delivery_order_items 
DROP CONSTRAINT IF EXISTS delivery_order_items_order_id_fkey;

ALTER TABLE public.delivery_order_items
ADD CONSTRAINT delivery_order_items_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.delivery_orders(id) 
ON DELETE CASCADE;

-- E os registros financeiros vinculados ao pedido
ALTER TABLE public.customer_ledgers 
DROP CONSTRAINT IF EXISTS customer_ledgers_order_id_fkey;

ALTER TABLE public.customer_ledgers
ADD CONSTRAINT customer_ledgers_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.delivery_orders(id) 
ON DELETE CASCADE;
