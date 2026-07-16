
CREATE OR REPLACE FUNCTION public.consume_stock_for_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_line RECORD;
  v_qty numeric;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.delivery_order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
  LOOP
    FOR v_line IN
      SELECT pr.ingredient_id, pr.quantity, COALESCE(pr.waste_percentage,0) AS waste,
             ing.cost_per_unit
      FROM public.product_recipe pr
      JOIN public.products ing ON ing.id = pr.ingredient_id
      WHERE pr.product_id = v_item.product_id
        AND pr.variant_label IS NULL
    LOOP
      v_qty := COALESCE(v_line.quantity,0) * (1 + v_line.waste/100.0) * v_item.quantity;
      IF v_qty <= 0 THEN CONTINUE; END IF;

      INSERT INTO public.stock_movements
        (product_id, movement_type, quantity, unit_cost, reason, reference_id, reference_type)
      VALUES
        (v_line.ingredient_id, 'SAIDA', v_qty, COALESCE(v_line.cost_per_unit,0),
         'Consumo automático por venda', p_order_id, 'VENDA');

      UPDATE public.products
      SET current_stock = COALESCE(current_stock,0) - v_qty,
          updated_at = now()
      WHERE id = v_line.ingredient_id;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_consume_stock_on_order_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_done_new boolean;
  v_done_old boolean;
BEGIN
  v_done_new := LOWER(COALESCE(NEW.status,'')) IN ('delivered','completed','concluido','concluído','finalizado','entregue');
  v_done_old := LOWER(COALESCE(OLD.status,'')) IN ('delivered','completed','concluido','concluído','finalizado','entregue');

  IF v_done_new AND NOT v_done_old THEN
    -- proteção contra duplicidade
    IF NOT EXISTS (
      SELECT 1 FROM public.stock_movements
      WHERE reference_id = NEW.id AND reference_type = 'VENDA'
    ) THEN
      PERFORM public.consume_stock_for_order(NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS delivery_orders_consume_stock ON public.delivery_orders;
CREATE TRIGGER delivery_orders_consume_stock
AFTER UPDATE OF status ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_consume_stock_on_order_complete();
