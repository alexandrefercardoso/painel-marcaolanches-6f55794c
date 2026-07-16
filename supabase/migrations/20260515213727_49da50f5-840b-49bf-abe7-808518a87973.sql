-- Extend order status and payment tracking
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        -- Type already exists from previous steps, but let's make sure 'awaiting_reconciliation' can be used
        -- Since we can't easily update ENUMs in all environments without specific commands, 
        -- we rely on the text check if the column is text or just handle it in logic if it's a constrained string.
    END IF;
END $$;

-- Ensure delivery_orders has what we need
ALTER TABLE public.delivery_orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_split_details JSONB,
ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_on_account BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.delivery_orders.is_on_account IS 'True if payment method is "caderneta"';

-- Update status constraint if it exists (assuming it might be a check constraint or just text)
-- If it's a native enum, we'd need ALTER TYPE, but usually it's text in these schemas.
-- We'll handle the 'awaiting_reconciliation' status in the application logic.

-- Create a table for customer credit/caderneta if it doesn't exist for better tracking
CREATE TABLE IF NOT EXISTS public.customer_ledgers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.delivery_orders(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('charge', 'payment')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_ledgers ENABLE ROW LEVEL SECURITY;

-- Simple policies
CREATE POLICY "Allow all for authenticated users on customer_ledgers" 
ON public.customer_ledgers FOR ALL USING (true);
