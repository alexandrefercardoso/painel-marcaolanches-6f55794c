-- Final RLS repair for store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow all for store_settings" ON public.store_settings;

-- Create a truly permissive policy for the public/anon roles as the app uses them
CREATE POLICY "Public full access to store_settings" ON public.store_settings 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- Ensure permissions are granted to the right roles
GRANT ALL ON public.store_settings TO anon;
GRANT ALL ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

-- Repair/Sync updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER update_store_settings_updated_at
    BEFORE UPDATE ON public.store_settings
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
