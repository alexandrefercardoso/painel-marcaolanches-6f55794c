GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

DO $$
DECLARE
    obj record;
BEGIN
    FOR obj IN
        SELECT c.relname AS object_name, c.relkind
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p', 'v', 'm')
    LOOP
        IF obj.relkind IN ('r', 'p') THEN
            EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', obj.object_name);
            EXECUTE format('GRANT ALL ON public.%I TO service_role', obj.object_name);
        ELSE
            EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', obj.object_name);
            EXECUTE format('GRANT SELECT ON public.%I TO service_role', obj.object_name);
        END IF;
    END LOOP;
END;
$$;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;