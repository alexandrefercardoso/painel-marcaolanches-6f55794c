ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update RLS policies for customers if needed (optional for now as we use upsert by phone)
-- Creating a simple login function for customers is usually done via Auth, 
-- but for a simple "client area" with phone/password or email/password we can handle it manually.