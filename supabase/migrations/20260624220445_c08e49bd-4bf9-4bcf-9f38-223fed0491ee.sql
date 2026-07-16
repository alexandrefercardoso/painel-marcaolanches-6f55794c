ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS print_paper_format text DEFAULT 'thermal_80mm',
ADD COLUMN IF NOT EXISTS thermal_printer_model text;