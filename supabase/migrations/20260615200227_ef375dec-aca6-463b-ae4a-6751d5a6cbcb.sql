-- 1. Campos fiscais em store_settings
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS client_id text,
  ADD COLUMN IF NOT EXISTS client_secret text,
  ADD COLUMN IF NOT EXISTS access_token_nfe text,
  ADD COLUMN IF NOT EXISTS access_token_nfce text,
  ADD COLUMN IF NOT EXISTS access_token_nuvemf_cep text,
  ADD COLUMN IF NOT EXISTS expire_token_nuvemf_cep timestamptz,
  ADD COLUMN IF NOT EXISTS scope_nuvemf_cep text,
  ADD COLUMN IF NOT EXISTS access_token_nuvemf_nfce text,
  ADD COLUMN IF NOT EXISTS expire_token_nuvemf_nfce timestamptz,
  ADD COLUMN IF NOT EXISTS scope_nuvemf_nfce text,
  ADD COLUMN IF NOT EXISTS access_token_nuvemf_nfe text,
  ADD COLUMN IF NOT EXISTS expire_token_nuvemf_nfe timestamptz,
  ADD COLUMN IF NOT EXISTS scope_nuvemf_nfe text;

-- 2. Tabela de endpoints fiscais editáveis
CREATE TABLE IF NOT EXISTS public.fiscal_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  url text NOT NULL,
  method text NOT NULL DEFAULT 'POST',
  description text,
  category text NOT NULL DEFAULT 'geral',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_endpoints TO authenticated;
GRANT ALL ON public.fiscal_endpoints TO service_role;

ALTER TABLE public.fiscal_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fiscal_endpoints_select_all"
  ON public.fiscal_endpoints FOR SELECT
  USING (true);

CREATE POLICY "fiscal_endpoints_modify_all"
  ON public.fiscal_endpoints FOR ALL
  USING (true) WITH CHECK (true);

CREATE TRIGGER trg_fiscal_endpoints_updated_at
  BEFORE UPDATE ON public.fiscal_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Endpoints padrão NuvemFiscal
INSERT INTO public.fiscal_endpoints (key, label, url, method, category, description) VALUES
  ('auth_token', 'Autenticação OAuth', 'https://auth.nuvemfiscal.com.br/oauth/token', 'POST', 'auth', 'Obter access_token via client_credentials'),
  ('nfe_emitir', 'Emitir NFe', 'https://api.nuvemfiscal.com.br/nfe', 'POST', 'nfe', 'Emissão de NFe modelo 55'),
  ('nfe_consultar', 'Consultar NFe', 'https://api.nuvemfiscal.com.br/nfe/{id}', 'GET', 'nfe', 'Consulta status NFe'),
  ('nfe_cancelar', 'Cancelar NFe', 'https://api.nuvemfiscal.com.br/nfe/{id}/cancelamento', 'POST', 'nfe', 'Cancelamento de NFe'),
  ('nfe_inutilizar', 'Inutilizar NFe', 'https://api.nuvemfiscal.com.br/nfe/inutilizacoes', 'POST', 'nfe', 'Inutilização de numeração NFe'),
  ('nfe_xml', 'Download XML NFe', 'https://api.nuvemfiscal.com.br/nfe/{id}/xml', 'GET', 'nfe', 'Baixar XML autorizado'),
  ('nfe_danfe', 'Download DANFE NFe', 'https://api.nuvemfiscal.com.br/nfe/{id}/pdf', 'GET', 'nfe', 'Baixar PDF DANFE'),
  ('nfce_emitir', 'Emitir NFCe', 'https://api.nuvemfiscal.com.br/nfce', 'POST', 'nfce', 'Emissão de NFCe modelo 65'),
  ('nfce_consultar', 'Consultar NFCe', 'https://api.nuvemfiscal.com.br/nfce/{id}', 'GET', 'nfce', 'Consulta status NFCe'),
  ('nfce_cancelar', 'Cancelar NFCe', 'https://api.nuvemfiscal.com.br/nfce/{id}/cancelamento', 'POST', 'nfce', 'Cancelamento de NFCe'),
  ('nfce_inutilizar', 'Inutilizar NFCe', 'https://api.nuvemfiscal.com.br/nfce/inutilizacoes', 'POST', 'nfce', 'Inutilização de numeração NFCe'),
  ('nfce_xml', 'Download XML NFCe', 'https://api.nuvemfiscal.com.br/nfce/{id}/xml', 'GET', 'nfce', 'Baixar XML autorizado'),
  ('nfce_danfe', 'Download DANFCE', 'https://api.nuvemfiscal.com.br/nfce/{id}/pdf', 'GET', 'nfce', 'Baixar PDF DANFCE'),
  ('cep_consultar', 'Consultar CEP', 'https://api.nuvemfiscal.com.br/cep/{cep}', 'GET', 'utilitario', 'Consulta de CEP')
ON CONFLICT (key) DO NOTHING;