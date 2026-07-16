ALTER TABLE public.printing_jobs 
DROP CONSTRAINT IF EXISTS printing_jobs_order_id_fkey;

ALTER TABLE public.printing_jobs
ADD CONSTRAINT printing_jobs_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.delivery_orders(id) 
ON DELETE CASCADE;
