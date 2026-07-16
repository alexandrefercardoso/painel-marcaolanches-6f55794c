-- Desabilitar RLS temporariamente para garantir acesso total ao sistema de login manual
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Garantir que todos os privilégios básicos existam para a role anon e authenticated
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;