-- Criar bucket de produtos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir acesso público para leitura das imagens
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Permitir que usuários autenticados (ou anônimos se configurado assim) façam upload
-- Como o sistema usa login manual e anon key, vamos permitir anon para este caso específico se necessário,
-- mas geralmente authenticated já cobre se o cliente injeta o token.
-- Para garantir funcionamento com o sistema de login manual, vamos permitir anon por enquanto.
CREATE POLICY "Allow Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'products');

-- Permitir exclusão (para troca de imagem)
CREATE POLICY "Allow Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'products');