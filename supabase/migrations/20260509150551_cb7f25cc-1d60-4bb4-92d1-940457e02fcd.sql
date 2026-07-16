-- Adicionar campos de localização na configuração da loja
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Adicionar campo de bairro nas áreas de entrega
ALTER TABLE public.delivery_areas
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Adicionar coluna de endereço para entrega na tabela de áreas de entrega (opcional, para ser mais preciso)
ALTER TABLE public.delivery_areas
ADD COLUMN IF NOT EXISTS full_address TEXT;
