
-- Tabela para campanhas semanais (banners dinâmicos por dia da semana)
CREATE TABLE IF NOT EXISTS public.weekly_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video','gif')),
  media_url text,
  title text,
  subtitle text,
  button_text text,
  button_link text,
  background_color text,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  priority int NOT NULL DEFAULT 0,
  show_mode text NOT NULL DEFAULT 'always' CHECK (show_mode IN ('always','once_per_day')),
  auto_close_seconds int,
  muted boolean NOT NULL DEFAULT true,
  autoplay boolean NOT NULL DEFAULT true,
  views_count int NOT NULL DEFAULT 0,
  clicks_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_campaigns_day ON public.weekly_campaigns(day_of_week, is_active);

ALTER TABLE public.weekly_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for everyone on weekly_campaigns"
  ON public.weekly_campaigns FOR ALL
  USING (true) WITH CHECK (true);

CREATE TRIGGER set_weekly_campaigns_updated_at
  BEFORE UPDATE ON public.weekly_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket público para mídias das campanhas
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Campaigns media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaigns');

CREATE POLICY "Campaigns media public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'campaigns');

CREATE POLICY "Campaigns media public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'campaigns');

CREATE POLICY "Campaigns media public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'campaigns');

-- Funções RPC para incremento atômico (analytics)
CREATE OR REPLACE FUNCTION public.increment_campaign_view(campaign_id uuid)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE public.weekly_campaigns SET views_count = views_count + 1 WHERE id = campaign_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_campaign_click(campaign_id uuid)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE public.weekly_campaigns SET clicks_count = clicks_count + 1 WHERE id = campaign_id;
$$;
