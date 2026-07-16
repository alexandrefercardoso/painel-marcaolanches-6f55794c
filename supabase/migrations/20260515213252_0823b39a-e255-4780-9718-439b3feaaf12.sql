-- Remove columns from delivery_orders
ALTER TABLE public.delivery_orders 
DROP COLUMN IF EXISTS is_on_account,
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS delivery_notes,
DROP COLUMN IF EXISTS delivery_confirmed_at;

-- Remove columns from delivery_order_items
ALTER TABLE public.delivery_order_items
DROP COLUMN IF EXISTS is_delivered,
DROP COLUMN IF EXISTS delivered_at;