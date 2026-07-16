
CREATE TABLE public.fiscal_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid,
  tipo text,
  titulo text NOT NULL,
  mensagem text,
  diagnostics jsonb,
  raw text,
  usuario_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fiscal_error_logs TO authenticated;
GRANT ALL ON public.fiscal_error_logs TO service_role;

ALTER TABLE public.fiscal_error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read fiscal_error_logs"
  ON public.fiscal_error_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert fiscal_error_logs"
  ON public.fiscal_error_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can delete fiscal_error_logs"
  ON public.fiscal_error_logs FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_fiscal_error_logs_pedido ON public.fiscal_error_logs(pedido_id);
CREATE INDEX idx_fiscal_error_logs_created ON public.fiscal_error_logs(created_at DESC);
