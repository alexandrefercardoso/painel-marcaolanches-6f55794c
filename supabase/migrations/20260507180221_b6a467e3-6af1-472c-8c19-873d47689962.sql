-- Ajustar a função handle_new_user com search_path e restrições de acesso
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Revogar permissão de execução de todos (por padrão) e conceder apenas ao sistema se necessário
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
