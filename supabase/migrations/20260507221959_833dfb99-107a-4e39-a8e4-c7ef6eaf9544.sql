ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

UPDATE public.categories SET "order" = 10 WHERE name = 'Pizza Grande';
UPDATE public.categories SET "order" = 20 WHERE name = 'Pizza Média';
UPDATE public.categories SET "order" = 30 WHERE name = 'Pizza Doce';
UPDATE public.categories SET "order" = 40 WHERE name = 'Calzone';
UPDATE public.categories SET "order" = 50 WHERE name = 'Bebidas';