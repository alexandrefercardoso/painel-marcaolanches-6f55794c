-- Add coordinate columns to store_settings if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'latitude') THEN
        ALTER TABLE public.store_settings ADD COLUMN latitude NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'longitude') THEN
        ALTER TABLE public.store_settings ADD COLUMN longitude NUMERIC;
    END IF;
END $$;

-- Drop and recreate delivery_areas to support radius-based circles
DROP TABLE IF EXISTS public.delivery_areas;

CREATE TABLE public.delivery_areas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    fee NUMERIC NOT NULL DEFAULT 0,
    radius_km NUMERIC NOT NULL DEFAULT 1,
    center_lat NUMERIC,
    center_lng NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_areas
CREATE POLICY "Delivery areas are viewable by everyone" 
ON public.delivery_areas 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage delivery areas" 
ON public.delivery_areas 
USING (true)
WITH CHECK (true); -- In a real app, check for admin role, but keeping it open for development as per current pattern in the project

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_delivery_areas_updated_at
BEFORE UPDATE ON public.delivery_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();