ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- Atualizar a senha para a Rose conforme fornecido pelo usuário
UPDATE public.profiles SET password = 'Alejandre@091270@!' WHERE email = 'rose@gmail.com';