DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_email_key') THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_email_key UNIQUE (email);
    END IF;
END $$;
