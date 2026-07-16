ALTER TABLE public.store_settings 
ADD COLUMN fixed_delivery_fee NUMERIC(10,2);

COMMENT ON COLUMN public.store_settings.fixed_delivery_fee IS 'Taxa de entrega fixa que, se preenchida, ignora a área de ação e geolocalização.';