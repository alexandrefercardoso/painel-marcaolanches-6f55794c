ALTER TABLE public.weekly_campaigns
ADD CONSTRAINT weekly_campaigns_button_link_safe
CHECK (
  button_link IS NULL
  OR btrim(button_link) = ''
  OR btrim(button_link) ~* '^(https?://|#)'
) NOT VALID;