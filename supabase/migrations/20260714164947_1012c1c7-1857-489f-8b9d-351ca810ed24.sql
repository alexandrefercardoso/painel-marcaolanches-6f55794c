CREATE OR REPLACE FUNCTION public.consume_stock_for_order(p_order_id uuid)
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
  v_ctrl boolean;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.delivery_order_items
    WHERE order_id = p_order_id AND product_id IS NOT NULL
  LOOP
    SELECT COALESCE(control_inventory, false) INTO v_ctrl
    FROM public.products WHERE id = v_item.product_id;

    IF NOT COALESCE(v_ctrl, false) THEN CONTINUE; END IF;

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
        WHERE pr.product_id = v_item.product_id AND pr.variant_label IS NULL
      LOOP
        v_qty := COALESCE(v_line.quantity,0) * (1 + v_line.waste/100.0) * v_item.quantity;
        IF v_qty <= 0 THEN CONTINUE; END IF;

        INSERT INTO public.stock_movements
          (product_id, movement_type, quantity, unit_cost, reason, reference_id, reference_type)
        VALUES
          (v_line.ingredient_id, 'SAIDA', v_qty, COALESCE(v_line.cost_per_unit,0),
           'Consumo automático por venda', p_order_id, 'VENDA');

        UPDATE public.products
        SET current_stock = COALESCE(current_stock,0) - v_qty
        WHERE id = v_line.ingredient_id;
      END LOOP;
    ELSE
      SELECT id, COALESCE(cost_per_unit, purchase_price, 0) AS unit_cost
      INTO v_prod FROM public.products WHERE id = v_item.product_id;

      IF v_prod.id IS NOT NULL AND COALESCE(v_item.quantity,0) > 0 THEN
        INSERT INTO public.stock_movements
          (product_id, movement_type, quantity, unit_cost, reason, reference_id, reference_type)
        VALUES
          (v_prod.id, 'SAIDA', v_item.quantity, COALESCE(v_prod.unit_cost,0),
           'Venda direta (sem ficha técnica)', p_order_id, 'VENDA');

        UPDATE public.products
        SET current_stock = COALESCE(current_stock,0) - v_item.quantity
        WHERE id = v_prod.id;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

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
  v_ctrl boolean;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM public.table_order_items
    WHERE session_id = p_session_id
      AND product_id IS NOT NULL
      AND COALESCE(status,'') <> 'cancelled'
  LOOP
    SELECT COALESCE(control_inventory, false) INTO v_ctrl
    FROM public.products WHERE id = v_item.product_id;

    IF NOT COALESCE(v_ctrl, false) THEN CONTINUE; END IF;

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
        WHERE pr.product_id = v_item.product_id AND pr.variant_label IS NULL
      LOOP
        v_qty := COALESCE(v_line.quantity,0) * (1 + v_line.waste/100.0) * v_item.quantity;
        IF v_qty <= 0 THEN CONTINUE; END IF;

        INSERT INTO public.stock_movements
          (product_id, movement_type, quantity, unit_cost, reason, reference_id, reference_type)
        VALUES
          (v_line.ingredient_id, 'SAIDA', v_qty, COALESCE(v_line.cost_per_unit,0),
           'Consumo automático por mesa', p_session_id, 'MESA');

        UPDATE public.products
        SET current_stock = COALESCE(current_stock,0) - v_qty
        WHERE id = v_line.ingredient_id;
      END LOOP;
    ELSE
      SELECT id, COALESCE(cost_per_unit, purchase_price, 0) AS unit_cost
      INTO v_prod FROM public.products WHERE id = v_item.product_id;

      IF v_prod.id IS NOT NULL AND COALESCE(v_item.quantity,0) > 0 THEN
        INSERT INTO public.stock_movements
          (product_id, movement_type, quantity, unit_cost, reason, reference_id, reference_type)
        VALUES
          (v_prod.id, 'SAIDA', v_item.quantity, COALESCE(v_prod.unit_cost,0),
           'Venda direta em mesa (sem ficha técnica)', p_session_id, 'MESA');

        UPDATE public.products
        SET current_stock = COALESCE(current_stock,0) - v_item.quantity
        WHERE id = v_prod.id;
      END IF;
    END IF;
  END LOOP;
END;
$function$;