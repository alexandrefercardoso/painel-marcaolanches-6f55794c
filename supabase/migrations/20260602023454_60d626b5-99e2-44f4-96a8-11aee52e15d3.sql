-- Atualizar a função update_updated_at_column para ser segura
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        NEW.updated_at = now();
    EXCEPTION WHEN undefined_column THEN
        -- Se a coluna não existir, ignoramos o erro silenciosamente
        RETURN NEW;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Atualizar a função handle_updated_at para ser segura também
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        NEW.updated_at = now();
    EXCEPTION WHEN undefined_column THEN
        RETURN NEW;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
