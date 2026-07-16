-- Add new columns to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- We'll keep customer_address in delivery_orders as a single text for historical snapshot, 
-- but we might want to ensure it's easy to concatenate.
