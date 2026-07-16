-- Update column comment for professional terminology
COMMENT ON COLUMN public.delivery_orders.is_on_account IS 'Indicates if the order is a corporate or recurring customer billing (Contas a Receber).';

-- Add payment_status to track if the account was settled
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'delivery_orders' AND column_name = 'payment_status') THEN
        ALTER TABLE public.delivery_orders ADD COLUMN payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid'));
    END IF;
END $$;
