-- Verifica se o bucket existe e cria se necessário
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir INSERT público (necessário para o upload funcionar via cliente sem auth completa)
CREATE POLICY "Permitir upload público de campanhas"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'campaigns');

-- Política para permitir SELECT público
CREATE POLICY "Permitir visualização pública de campanhas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaigns');

-- Política para permitir UPDATE público (opcional, mas útil para o parâmetro upsert: true)
CREATE POLICY "Permitir atualização pública de campanhas"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'campaigns');