ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS is_menu_active BOOLEAN DEFAULT true;

-- Update RLS if needed (usually store_settings is public read, but lets ensure it)
CREATE POLICY "Enable update for admins" ON public.store_settings
FOR UPDATE USING (true) WITH CHECK (true);