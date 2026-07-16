ALTER TABLE public.drivers 
ADD COLUMN has_fixed_fee BOOLEAN DEFAULT false,
ADD COLUMN fixed_fee NUMERIC(10,2) DEFAULT 0;