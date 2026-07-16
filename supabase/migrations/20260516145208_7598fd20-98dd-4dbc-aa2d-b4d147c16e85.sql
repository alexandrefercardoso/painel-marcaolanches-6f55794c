-- Adiciona colunas para localização do motoqueiro
ALTER TABLE public.delivery_orders 
ADD COLUMN IF NOT EXISTS motoqueiro_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS motoqueiro_lng DOUBLE PRECISION;

-- Garante que o Realtime está habilitado para a tabela (já deve estar, mas por segurança)
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_orders;
