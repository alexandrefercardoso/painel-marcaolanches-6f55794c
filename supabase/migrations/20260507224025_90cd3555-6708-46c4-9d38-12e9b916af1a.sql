-- Adiciona campos extras na tabela de store_settings
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Minha Pizzaria',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS sidebar_logo_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Garante que o RLS permite leitura pública e escrita (seguindo o padrão do projeto)
CREATE POLICY "Allow all operations for store settings" ON public.store_settings 
FOR ALL 
USING (true) 
WITH CHECK (true);