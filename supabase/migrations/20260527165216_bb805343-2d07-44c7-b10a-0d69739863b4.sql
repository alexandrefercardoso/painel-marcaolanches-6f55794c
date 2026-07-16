CREATE TABLE public.visual_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE UNIQUE,
  
  -- Base Colors
  primary_color TEXT DEFAULT '#ef4444',
  secondary_color TEXT DEFAULT '#1f2937',
  accent_color TEXT DEFAULT '#f59e0b',
  background_color TEXT DEFAULT '#f9fafb',
  text_color TEXT DEFAULT '#111827',
  
  -- UI Elements
  button_color TEXT DEFAULT '#ef4444',
  button_text_color TEXT DEFAULT '#ffffff',
  card_color TEXT DEFAULT '#ffffff',
  sidebar_color TEXT DEFAULT '#ffffff',
  header_color TEXT DEFAULT '#ffffff',
  icon_color TEXT DEFAULT '#6b7280',
  
  -- Status
  success_color TEXT DEFAULT '#22c55e',
  error_color TEXT DEFAULT '#ef4444',
  warning_color TEXT DEFAULT '#f59e0b',
  
  -- Menu specific
  menu_background_color TEXT DEFAULT '#f9fafb',
  menu_card_color TEXT DEFAULT '#ffffff',
  menu_price_color TEXT DEFAULT '#ef4444',
  menu_category_active_color TEXT DEFAULT '#ef4444',
  menu_add_button_color TEXT DEFAULT '#ef4444',
  menu_cart_icon_color TEXT DEFAULT '#ffffff',
  
  -- Settings
  theme_name TEXT DEFAULT 'default',
  dark_mode TEXT DEFAULT 'auto',
  border_radius TEXT DEFAULT '1rem',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_settings TO authenticated;
GRANT SELECT ON public.visual_settings TO anon;
GRANT ALL ON public.visual_settings TO service_role;

-- Enable RLS
ALTER TABLE public.visual_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view visual settings"
ON public.visual_settings
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage visual settings"
ON public.visual_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger for updated_at (using existing function if it exists, but safe to redefine)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_visual_settings_updated_at
BEFORE UPDATE ON public.visual_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
