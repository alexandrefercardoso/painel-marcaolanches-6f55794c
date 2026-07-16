-- Add is_on_account to delivery_orders
ALTER TABLE public.delivery_orders ADD COLUMN IF NOT EXISTS is_on_account BOOLEAN DEFAULT false;

-- Add comment to explain the column
COMMENT ON COLUMN public.delivery_orders.is_on_account IS 'Indicates if the order is to be paid later (on account/pendura).';
