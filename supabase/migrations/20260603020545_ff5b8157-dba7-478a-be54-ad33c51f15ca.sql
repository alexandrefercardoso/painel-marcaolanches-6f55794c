-- Fix: waiter passwords were publicly readable
DROP POLICY IF EXISTS "Waiters are viewable by everyone" ON public.waiters;
DROP POLICY IF EXISTS "Authenticated users can manage waiters" ON public.waiters;
DROP POLICY IF EXISTS "Waiters are manageable by authenticated users" ON public.waiters;

CREATE POLICY "Public manage waiters (non-sensitive)"
  ON public.waiters
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Column-level grants: password readable only by service_role
REVOKE SELECT ON public.waiters FROM anon, authenticated, PUBLIC;
GRANT SELECT (id, code, name, login, phone, active, has_commission, commission_percent, created_at, updated_at)
  ON public.waiters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.waiters TO anon, authenticated;
GRANT ALL ON public.waiters TO service_role;