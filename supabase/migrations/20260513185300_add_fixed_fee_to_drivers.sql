ALTER TABLE public.drivers 
ADD COLUMN has_fixed_fee BOOLEAN DEFAULT false,
ADD COLUMN fixed_fee NUMERIC DEFAULT 0;
