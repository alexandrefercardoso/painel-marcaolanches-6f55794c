
ALTER TABLE public.delivery_orders
  ADD COLUMN IF NOT EXISTS tipo_venda text,
  ADD COLUMN IF NOT EXISTS frete smallint NOT NULL DEFAULT 0;
