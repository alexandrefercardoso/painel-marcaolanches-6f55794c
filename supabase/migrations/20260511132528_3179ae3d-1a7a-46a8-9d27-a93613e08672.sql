-- Habilita a extensão pg_cron se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agenda a chamada da edge function a cada 5 minutos
-- Substitua <PROJECT_REF> pelo ID do seu projeto se necessário, mas o Lovable gerencia isso.
-- Como estamos em um ambiente gerenciado, chamamos via HTTP.
SELECT cron.schedule(
  'manage-menu-status-cron',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://vljgkkaiknbxcdayqseu.supabase.co/functions/v1/manage-menu-status',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);