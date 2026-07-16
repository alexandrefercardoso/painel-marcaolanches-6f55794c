GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;

NOTIFY pgrst, 'reload schema';