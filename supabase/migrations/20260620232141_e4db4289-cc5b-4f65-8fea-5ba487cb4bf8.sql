GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_note_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_note_config TO authenticated;
GRANT ALL ON public.fiscal_note_config TO service_role;

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.fiscal_note_config;
CREATE POLICY "Allow app access to fiscal note config"
ON public.fiscal_note_config
FOR ALL
TO public
USING (true)
WITH CHECK (true);