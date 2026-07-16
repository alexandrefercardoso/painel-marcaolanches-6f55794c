
CREATE OR REPLACE FUNCTION public.consume_stock_for_session(p_session_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_item RECORD;
  v_line RECORD;
  v_qty numeric;
  v_has_recipe boolean;
  v_prod RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.table_order_items
    WHERE session_id = p_session_id
      AND product_id IS NOT NULL
      AND COALESCE(status,'') <> 'cancelled'
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.product_recipe
      WHERE product_id = v_item.product_id AND variant_label IS NULL
    ) INTO v_has_recipe;

    IF v_has_recipe THEN
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
           'Consumo automático por mesa', p_session_id, 'MESA');

        UPDATE public.products
        SET current_stock = COALESCE(current_stock,0) - v_qty,
            updated_at = now()
        WHERE id = v_line.ingredient_id;
      END LOOP;
    ELSE
      SELECT id, COALESCE(cost_per_unit, purchase_price, 0) AS unit_cost
      INTO v_prod
      FROM public.products
      WHERE id = v_item.product_id;

      IF v_prod.id IS NOT NULL AND COALESCE(v_item.quantity,0) > 0 THEN
        INSERT INTO public.stock_movements
          (product_id, movement_type, quantity, unit_cost, reason, reference_id, reference_type)
        VALUES
          (v_prod.id, 'SAIDA', v_item.quantity, COALESCE(v_prod.unit_cost,0),
           'Venda direta em mesa (sem ficha técnica)', p_session_id, 'MESA');

        UPDATE public.products
        SET current_stock = COALESCE(current_stock,0) - v_item.quantity,
            updated_at = now()
        WHERE id = v_prod.id;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_consume_stock_on_session_close()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_done_new boolean;
  v_done_old boolean;
BEGIN
  v_done_new := LOWER(COALESCE(NEW.status,'')) IN ('closed','paid','finalizada','fechada','paga','concluida','concluída');
  v_done_old := LOWER(COALESCE(OLD.status,'')) IN ('closed','paid','finalizada','fechada','paga','concluida','concluída');

  IF v_done_new AND NOT v_done_old THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.stock_movements
      WHERE reference_id = NEW.id AND reference_type = 'MESA'
    ) THEN
      PERFORM public.consume_stock_for_session(NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_consume_stock_on_session_close ON public.table_sessions;

CREATE TRIGGER trg_consume_stock_on_session_close
AFTER UPDATE OF status ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.trg_consume_stock_on_session_close();
