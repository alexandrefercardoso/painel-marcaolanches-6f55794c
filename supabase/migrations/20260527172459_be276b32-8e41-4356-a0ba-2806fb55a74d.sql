-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.visual_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy for public access (matching the existing architecture)
CREATE POLICY "Allow public access to visual_settings" 
ON public.visual_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';