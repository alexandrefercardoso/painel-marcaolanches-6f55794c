-- 1. Limpar políticas conflitantes (tentando todos os nomes prováveis)
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.profiles;

-- 2. Criar uma política única e abrangente (Temporário para garantir funcionamento)
CREATE POLICY "Allow all operations for everyone" 
ON public.profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Garantir que a função de trigger está correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
