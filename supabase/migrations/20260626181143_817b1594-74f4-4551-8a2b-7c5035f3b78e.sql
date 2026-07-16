
CREATE TABLE public.app_version (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  version varchar(20) NOT NULL,
  release_date timestamptz NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_version TO anon, authenticated;
GRANT ALL ON public.app_version TO service_role;

ALTER TABLE public.app_version ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read app_version"
  ON public.app_version FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage app_version"
  ON public.app_version FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.ensure_single_active_version()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.active THEN
    UPDATE public.app_version SET active = false
    WHERE active = true AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ensure_single_active_version
AFTER INSERT OR UPDATE OF active ON public.app_version
FOR EACH ROW WHEN (NEW.active = true)
EXECUTE FUNCTION public.ensure_single_active_version();

INSERT INTO public.app_version (version, release_date, active)
VALUES ('1.0.0', now(), true);
