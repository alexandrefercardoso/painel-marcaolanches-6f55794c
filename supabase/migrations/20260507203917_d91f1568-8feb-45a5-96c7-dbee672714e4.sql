-- 1. Remover a restrição que exige que o usuário exista no Supabase Auth
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Garantir que RLS está desativado para permitir login manual
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Dar permissões de leitura para todos (anon e authenticated)
GRANT SELECT ON public.profiles TO anon, authenticated;

-- 4. Criar um usuário de teste agora que a restrição foi removida
INSERT INTO public.profiles (email, password, full_name, role)
VALUES ('teste@gmail.com', '123456', 'Usuário Teste', 'admin')
ON CONFLICT (email) DO NOTHING;