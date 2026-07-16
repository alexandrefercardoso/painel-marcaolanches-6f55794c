ALTER TABLE public.products 
ADD COLUMN cest TEXT,
ADD COLUMN cst TEXT,
ADD COLUMN ncm TEXT;

-- Adicionando comentários para documentação (opcional)
COMMENT ON COLUMN public.products.cest IS 'Código Especificador da Substituição Tributária (7 dígitos)';
COMMENT ON COLUMN public.products.cst IS 'Código de Situação Tributária (3 dígitos)';
COMMENT ON COLUMN public.products.ncm IS 'Nomenclatura Comum do Mercosul (8 dígitos)';