-- Adicionar extensão pgcrypto se necessário (geralmente já ativa)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Alterar a coluna id para usar gen_random_uuid() por padrão
ALTER TABLE public.profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();