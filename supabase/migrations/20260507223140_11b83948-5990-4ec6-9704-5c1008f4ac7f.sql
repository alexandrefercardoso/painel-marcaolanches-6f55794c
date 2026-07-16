-- Tabela para configurações gerais da loja
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_enabled BOOLEAN DEFAULT true,
    pickup_enabled BOOLEAN DEFAULT true,
    whatsapp_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para áreas de entrega e suas taxas
CREATE TABLE IF NOT EXISTS public.delivery_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configuração inicial se não existir
INSERT INTO public.store_settings (delivery_enabled, pickup_enabled)
SELECT true, true
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (Leitura pública, Escrita admin)
CREATE POLICY "Store settings are viewable by everyone" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Delivery areas are viewable by everyone" ON public.delivery_areas FOR SELECT USING (true);

-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_delivery_areas_updated_at BEFORE UPDATE ON public.delivery_areas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();