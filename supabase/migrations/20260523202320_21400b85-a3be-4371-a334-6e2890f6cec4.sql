-- 1) Fix search_path mutável em funções SECURITY DEFINER / triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_tracking_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    IF NEW.status = 'production' THEN
        NEW.tracking_status = 'preparing';
    ELSIF NEW.status = 'ready' THEN
        NEW.tracking_status = 'ready_for_pickup';
    ELSIF NEW.status = 'delivering' THEN
        NEW.tracking_status = 'on_the_way';
    ELSIF NEW.status = 'delivered' THEN
        NEW.tracking_status = 'delivered';
    ELSIF NEW.status = 'cancelled' THEN
        NEW.tracking_status = 'cancelled';
    END IF;
    RETURN NEW;
END;
$function$;

-- 2) Remover policies redundantes duplicadas em profiles (mantém uma única permissiva — não piora a segurança, só limpa)
DROP POLICY IF EXISTS "Permitir tudo para perfis" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations for everyone" ON public.profiles;
DROP POLICY IF EXISTS "Auth insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Auth update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can check if profile exists" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem ver perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar perfis" ON public.profiles;

-- Remover policies duplicadas em products (mantém somente uma)
DROP POLICY IF EXISTS "Allow all for anonymous" ON public.products;
DROP POLICY IF EXISTS "Allow public select products" ON public.products;

-- Remover policy duplicada em categories
DROP POLICY IF EXISTS "Categorias são visíveis para todos" ON public.categories;

-- Remover policies duplicadas em financial_transactions/categories
DROP POLICY IF EXISTS "Apenas autenticados gerenciam transações" ON public.financial_transactions;
DROP POLICY IF EXISTS "Apenas autenticados gerenciam categorias financeiras" ON public.financial_categories;

-- Remover policies duplicadas em complement_groups / complements / category_complement_groups
DROP POLICY IF EXISTS "Complement groups are viewable by everyone" ON public.complement_groups;
DROP POLICY IF EXISTS "Complements are viewable by everyone" ON public.complements;
DROP POLICY IF EXISTS "Category complement groups are viewable by everyone" ON public.category_complement_groups;

-- Remover policies redundantes em store_settings
DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON public.store_settings;
DROP POLICY IF EXISTS "Enable update for admins" ON public.store_settings;

-- Remover policy redundante em delivery_areas
DROP POLICY IF EXISTS "Delivery areas are viewable by everyone" ON public.delivery_areas;

-- Remover policy redundante em payment_methods
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON public.payment_methods;