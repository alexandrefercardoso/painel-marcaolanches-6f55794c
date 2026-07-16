-- Permitir leitura pública dos perfis para fins de validação (opcional, dependendo da segurança)
CREATE POLICY "Public can check if profile exists" 
ON public.profiles 
FOR SELECT 
USING (true);
