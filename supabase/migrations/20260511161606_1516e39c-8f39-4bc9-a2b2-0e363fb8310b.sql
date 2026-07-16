-- Add fields to customers table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'zip_code') THEN
        ALTER TABLE public.customers ADD COLUMN zip_code TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'city') THEN
        ALTER TABLE public.customers ADD COLUMN city TEXT DEFAULT 'S\u00e3o Paulo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'state') THEN
        ALTER TABLE public.customers ADD COLUMN state TEXT DEFAULT 'SP';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'address_number') THEN
        ALTER TABLE public.customers ADD COLUMN address_number TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customers' AND COLUMN_NAME = 'neighborhood') THEN
        ALTER TABLE public.customers ADD COLUMN neighborhood TEXT;
    END IF;
END $$;

-- Add fields to delivery_orders table
ALTER TABLE public.delivery_orders 
ADD COLUMN IF NOT EXISTS customer_cep TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT DEFAULT 'S\u00e3o Paulo',
ADD COLUMN IF NOT EXISTS customer_state TEXT DEFAULT 'SP',
ADD COLUMN IF NOT EXISTS estimated_delivery_time TEXT,
ADD COLUMN IF NOT EXISTS tracking_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS driver_location JSONB;

-- Update tracking_status when order status changes
CREATE OR REPLACE FUNCTION public.update_tracking_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'production' THEN
        NEW.tracking_status = 'preparing';
    ELSIF NEW.status = 'ready' THEN
        NEW.tracking_status = 'ready_for_pickup';
    ELSIF NEW.status = 'delivering' THEN
        NEW.tracking_status = 'on_the_way';
    ELSIF NEW.status = 'delivered' THEN
        NEW.tracking_status = 'delivered';
    ELSIF NEW.status = 'cancelled' THEN
        NEW.tracking_status = 'cancelled';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tracking_status ON public.delivery_orders;
CREATE TRIGGER trigger_update_tracking_status
BEFORE UPDATE OF status ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_tracking_status();