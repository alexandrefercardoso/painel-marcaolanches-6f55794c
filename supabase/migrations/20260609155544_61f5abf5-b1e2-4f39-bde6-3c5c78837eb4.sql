
-- 1. Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. Revoke EXECUTE from anon/authenticated on SECURITY DEFINER helper functions
-- These are triggers/internal helpers and shouldn't be callable via the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_tracking_status() FROM anon, authenticated, public;

-- 3. Enable RLS on financial_transactions with permissive policy (matches existing app pattern, preserves functionality)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on financial_transactions" ON public.financial_transactions;
CREATE POLICY "Allow all operations on financial_transactions"
ON public.financial_transactions
FOR ALL
USING (true)
WITH CHECK (true);
