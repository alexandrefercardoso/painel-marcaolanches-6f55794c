-- Add kds_enabled column to store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS kds_enabled BOOLEAN DEFAULT true;

-- Update existing records to have kds_enabled = true
UPDATE public.store_settings SET kds_enabled = true WHERE kds_enabled IS NULL;
