-- Add columns to delivery_order_items to track per-item delivery if needed
ALTER TABLE public.delivery_order_items 
ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add columns to delivery_orders for delivery confirmation and notes
ALTER TABLE public.delivery_orders 
ADD COLUMN IF NOT EXISTS delivery_notes TEXT,
ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Update RLS policies is not needed as they usually cover all columns if SELECT/UPDATE is allowed
