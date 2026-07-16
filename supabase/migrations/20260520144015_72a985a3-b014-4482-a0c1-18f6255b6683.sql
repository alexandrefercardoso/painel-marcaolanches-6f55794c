-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Complement groups are manageable by authenticated users" ON public.complement_groups;
DROP POLICY IF EXISTS "Complements are manageable by authenticated users" ON public.complements;
DROP POLICY IF EXISTS "Category complement groups are manageable by authenticated user" ON public.category_complement_groups;

-- Create more permissive policies for management
CREATE POLICY "Enable all operations for all users on complement_groups" 
ON public.complement_groups FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on complements" 
ON public.complements FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on category_complement_groups" 
ON public.category_complement_groups FOR ALL 
USING (true) 
WITH CHECK (true);
