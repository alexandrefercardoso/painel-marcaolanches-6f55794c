-- Fix mutable search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Revoke EXECUTE on SECURITY DEFINER triggers from public API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;