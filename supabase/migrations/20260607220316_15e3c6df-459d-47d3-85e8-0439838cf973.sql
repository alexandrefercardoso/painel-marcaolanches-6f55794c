-- Grant permissions to anon role for table management and printing
GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_tables TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waiters TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printer_sectors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_printer_mappings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.printing_jobs TO anon, authenticated;

-- Ensure RLS allows these roles if enabled
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printer_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_printer_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all for these tables (since app handles auth internally)
CREATE POLICY "Public manage table_sessions" ON public.table_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage table_order_items" ON public.table_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage restaurant_tables" ON public.restaurant_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage waiters" ON public.waiters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage printers" ON public.printers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage printer_sectors" ON public.printer_sectors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage category_printer_mappings" ON public.category_printer_mappings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public manage printing_jobs" ON public.printing_jobs FOR ALL USING (true) WITH CHECK (true);
