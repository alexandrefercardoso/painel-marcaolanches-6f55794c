import { supabase } from "@/integrations/supabase/client";
import { gerarHtmlImpressao } from "@/lib/print-template";


export async function processPrintingForTableOrder(sessionId: string, itemIds: string[], isCancellation: boolean = false) {
  try {
    console.log(`[TablePrinting] Iniciando para sessão: ${sessionId}`);

    const { data: session, error: sessionError } = await supabase
      .from("table_sessions")
      .select("*, restaurant_tables(*), waiters(*)")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      console.error("[TablePrinting] Sessão não encontrada:", sessionError);
      return;
    }

    const { data: itemsRaw, error: itemsError } = await supabase
      .from("table_order_items")
      .select("*, products(category_id, send_to_production)")
      .in("id", itemIds);

    // Busca config cedo para decidir se filtramos por send_to_production
    const { data: storeSettings } = await supabase
      .from("store_settings")
      .select("print_item_separately, centralized_printing, table_print_mode")
      .single();

    const isGroupedMode = storeSettings?.table_print_mode === 'grouped';

    // No modo AGRUPADO, imprime TODOS os itens lançados (mesmo sem send_to_production).
    // Nos demais modos, respeita a flag do produto.
    const items = isGroupedMode
      ? (itemsRaw || [])
      : (itemsRaw || []).filter((i: any) => i.products?.send_to_production !== false);

    if (itemsError || !items || items.length === 0) {
      console.error("[TablePrinting] Itens não encontrados:", itemsError);
      return;
    }

    const printers_res = await supabase.from("printers").select("*");
    const printers = printers_res.data || [];

    if (printers.length === 0) {
      console.warn("[TablePrinting] Nenhuma impressora ativa no sistema.");
      return;
    }

    const isCentralized = storeSettings?.centralized_printing === true;
    // Regra: table_print_mode='grouped' SEMPRE agrupa (prioridade sobre print_item_separately).
    const printSeparately = isGroupedMode ? false : storeSettings?.print_item_separately === true;
    console.log(`[TablePrinting] Modo: ${printSeparately ? 'INDIVIDUAL (por item)' : 'AGRUPADO (por setor)'} | table_print_mode=${storeSettings?.table_print_mode} | print_item_separately=${storeSettings?.print_item_separately}`);

    // Buscar TODAS as comandas envolvidas nos itens (um cupom por comanda)
    const comandaIds = Array.from(
      new Set((itemsRaw || []).map((i: any) => i.comanda_id).filter(Boolean))
    ) as string[];
    const comandaMap: Record<string, string> = {};
    if (comandaIds.length > 0) {
      const { data: comandas } = await supabase
        .from("comandas" as any)
        .select("id, numero, identificacao")
        .in("id", comandaIds);
      (comandas || []).forEach((c: any) => {
        comandaMap[c.id] = `#${String(c.numero).padStart(3, '0')}${c.identificacao ? ' · ' + c.identificacao : ''}`;
      });
    }

    // Agrupa itens por comanda_id (null = sem comanda)
    const groupsByComanda = new Map<string | null, any[]>();
    for (const it of items) {
      const key = (it as any).comanda_id || null;
      if (!groupsByComanda.has(key)) groupsByComanda.set(key, []);
      groupsByComanda.get(key)!.push(it);
    }

    const baseSessionInfo = {
      order_number: `MESA ${session.restaurant_tables?.number || session.command_number || ""}`,
      customer_name: session.client_name || "Mesa",
      waiter_name: session.waiters?.name || "N/A",
      order_type: "DINE_IN",
      notes: session.observations,
      total: session.total_amount,
      created_at: new Date().toISOString(),
      printing_type: isCancellation ? "cancellation" : "full",
      is_cancellation: isCancellation,
    };

    let totalJobsInserted = 0;

    // Processa cada comanda separadamente → gera um cupom por comanda
    for (const [comandaId, groupItems] of groupsByComanda.entries()) {
      const comandaNumero = comandaId ? comandaMap[comandaId] || null : null;
      const baseContent = { ...baseSessionInfo, comanda_numero: comandaNumero };

      const mapItem = (item: any) => ({
        name: item.product_name || "Produto",
        quantity: item.quantity,
        price: item.unit_price,
        notes: item.observations,
        complements: item.selected_complements,
      });
      const mappedItems = groupItems.map(mapItem);

      if (isCentralized) {
        const printer =
          printers.find((p) =>
            p.name.toUpperCase().includes("CAIXA") ||
            p.name.toUpperCase().includes("PDF") ||
            p.name.toUpperCase().includes("VIRTUAL")
          ) || printers[0];

        const batches = printSeparately ? mappedItems.map((it) => [it]) : [mappedItems];
        for (const batch of batches) {
          const { error } = await supabase.from("printing_jobs").insert([{
            printer_id: printer.id,
            status: "pending",
            copies: printer.copies,
            content: JSON.stringify({ ...baseContent, sector_name: "CAIXA GERAL", items: batch }),
          } as any]);
          if (error) console.error("[TablePrinting] Erro ao inserir job:", error);
          else totalJobsInserted++;
        }
      } else {
        const { data: sectors } = await supabase.from("printer_sectors").select("*");
        const { data: mappings } = await supabase.from("category_printer_mappings").select("*");
        const activeSectors = sectors || [];
        const activeMappings = mappings || [];

        for (const sector of activeSectors) {
          let itemsToPrint: any[];
          if (sector.name === "caixa") {
            itemsToPrint = groupItems;
          } else {
            const linkedCategoryIds = activeMappings
              .filter((m) => m.sector_id === sector.id)
              .map((m) => m.category_id);
            itemsToPrint = groupItems.filter((item: any) => {
              const categoryId = item.products?.category_id || item.category_id;
              return categoryId && linkedCategoryIds.includes(categoryId);
            });
          }
          if (itemsToPrint.length === 0) continue;

          let sectorPrinters = printers.filter((p) => p.sector_id === sector.id);
          if (sectorPrinters.length === 0) sectorPrinters = [printers[0]];

          for (const printer of sectorPrinters) {
            const batches = printSeparately
              ? itemsToPrint.map((it: any) => [mapItem(it)])
              : [itemsToPrint.map(mapItem)];
            for (const batch of batches) {
              const { error } = await supabase.from("printing_jobs").insert([{
                printer_id: printer.id,
                status: "pending",
                copies: printer.copies,
                content: JSON.stringify({
                  ...baseContent,
                  sector_name: sector.name,
                  printing_type: isCancellation ? "cancellation" : "full",
                  items: batch,
                }),
              } as any]);
              if (!error) totalJobsInserted++;
              else console.error("[TablePrinting] Erro ao inserir job:", error);
            }
          }
        }
      }
    }

    if (totalJobsInserted === 0) {
      console.warn("[TablePrinting] Nenhum job gerado, usando fallback centralizado.");
      const fallbackItems = items.map((item: any) => ({
        name: item.product_name || "Produto",
        quantity: item.quantity,
        price: item.unit_price,
        notes: item.observations,
        complements: item.selected_complements,
      }));
      const { error } = await supabase.from("printing_jobs").insert([{
        printer_id: printers[0].id,
        status: "pending",
        copies: printers[0].copies,
        content: JSON.stringify({ ...baseSessionInfo, sector_name: "GERAL", items: fallbackItems }),
      } as any]);
      if (error) console.error("[TablePrinting] Erro no fallback:", error);
    }

    await supabase.from("table_order_items").update({ printed: true }).in("id", itemIds);
    console.log("[TablePrinting] Processamento concluído.");

  } catch (error) {
    console.error("[TablePrinting] Erro crítico:", error);
  }
}

export async function printFullBill(sessionId: string) {
  try {
    const { data: session, error: sessionError } = await supabase
      .from("table_sessions")
      .select("*, restaurant_tables(*), waiters(*)")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) throw sessionError;

    const { data: items } = await supabase
      .from("table_order_items")
      .select("*")
      .eq("session_id", sessionId);

    const { data: storeSettings } = await supabase.from("store_settings").select("*").single();

    const subtotal = (items || []).reduce((acc, i) => acc + Number(i.total_price), 0);
    const isServiceTaxEnabled = storeSettings?.service_tax_enabled === true;
    const serviceTax = isServiceTaxEnabled ? subtotal * (Number(storeSettings?.service_tax_percent || 10) / 100) : 0;
    const total = subtotal + Number(session.couvert_value || 0) + serviceTax;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return false;

    const formato = ((storeSettings as any)?.print_paper_format || 'thermal_80mm') as 'a4' | 'thermal_80mm';

    const mappedItems = (items || []).map((item: any) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: item.unit_price,
      notes: item.observations,
      complements: (item.selected_complements as any[]) || [],
    }));

    const extrasNote = [
      `Subtotal: R$ ${subtotal.toFixed(2)}`,
      Number(session.couvert_value || 0) > 0 ? `Couvert: R$ ${Number(session.couvert_value).toFixed(2)}` : '',
      isServiceTaxEnabled ? `Taxa Serviço (${storeSettings?.service_tax_percent || 10}%): R$ ${serviceTax.toFixed(2)}` : '',
      `Por pessoa (${session.people_count || 1}): R$ ${(total / (session.people_count || 1)).toFixed(2)}`,
    ].filter(Boolean).join(' | ');

    const html = gerarHtmlImpressao({
      titulo: `CONFERÊNCIA DE MESA - ${storeSettings?.name || 'RESTAURANTE'}`,
      formato,
      content: {
        order_number: `MESA ${session.restaurant_tables?.number || ''}`,
        customer_name: session.client_name || undefined,
        waiter_name: session.waiters?.name || 'N/A',
        created_at: new Date().toISOString(),
        total,
        notes: extrasNote,
        items: mappedItems,
      },
      rodapePersonalizado: '*** NÃO É DOCUMENTO FISCAL ***',
    });

    printWindow.document.write(html);

    printWindow.document.close();
    return true;
  } catch (error) {
    console.error("[TablePrinting] Erro ao imprimir conta:", error);
    return false;
  }
}

/**
 * Imprime um COMPROVANTE DE PAGAMENTO (não fiscal) a partir de um pedido
 * já registrado em delivery_orders (usado no histórico e no fechamento de mesa).
 */
export async function printPaymentReceiptForOrder(
  orderId: string,
  extras?: { payments?: { method: string; amount: number }[]; service_tax_value?: number; couvert_value?: number; people_count?: number; change_amount?: number },
) {
  try {
    const { data: order, error } = await supabase
      .from("delivery_orders")
      .select("*, delivery_order_items(*)")
      .eq("id", orderId)
      .single();
    if (error || !order) throw error || new Error("Pedido não encontrado");

    const { data: storeSettings } = await supabase.from("store_settings").select("*").single();
    const formato = ((storeSettings as any)?.print_paper_format || 'thermal_80mm') as 'a4' | 'thermal_80mm';

    const items = (order.delivery_order_items || []).map((it: any) => ({
      name: it.product_name,
      quantity: it.quantity,
      price: it.unit_price,
      complements: (it.selected_complements as any[]) || [],
    }));

    const subtotal = items.reduce((acc: number, i: any) => acc + Number(i.price || 0) * Number(i.quantity || 1), 0);
    const couvert = Number(extras?.couvert_value || 0);
    const serviceTax = Number(extras?.service_tax_value || 0);
    const total = Number(order.total_amount || subtotal + couvert + serviceTax);

    const paymentsList = extras?.payments && extras.payments.length > 0
      ? extras.payments
      : (order.payment_method ? [{ method: String(order.payment_method), amount: total }] : []);

    const money = (v: number) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
    const summary: Array<{ label: string; value: string; strong?: boolean }> = [];
    summary.push({ label: 'Subtotal', value: money(subtotal) });
    if (couvert > 0) summary.push({ label: 'Couvert', value: money(couvert) });
    if (serviceTax > 0) summary.push({ label: 'Taxa de Serviço', value: money(serviceTax) });
    summary.push({ label: 'TOTAL PAGO', value: money(total), strong: true });
    if (paymentsList.length > 0) {
      paymentsList.forEach((p) => summary.push({ label: `Pgto: ${p.method}`, value: money(Number(p.amount)) }));
    }
    if (extras?.change_amount && extras.change_amount > 0.001) {
      summary.push({ label: 'Troco', value: money(extras.change_amount) });
    }
    if (extras?.people_count && extras.people_count > 1) {
      summary.push({ label: `Por pessoa (${extras.people_count})`, value: money(total / extras.people_count) });
    }

    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return false;

    const html = gerarHtmlImpressao({
      titulo: `COMPROVANTE DE PAGAMENTO`,
      formato,
      content: {
        order_number: `#${String(order.id).slice(-6).toUpperCase()}`,
        company_name: storeSettings?.name || undefined,
        customer_name: order.customer_name || undefined,
        customer_phone: order.customer_phone || undefined,
        customer_address: order.customer_address || undefined,
        created_at: order.created_at || new Date().toISOString(),
        total,
        payment_summary: summary,
        items,
      },
      rodapePersonalizado: '*** COMPROVANTE DE PAGAMENTO - NÃO É DOCUMENTO FISCAL ***',
    });


    win.document.write(html);
    win.document.close();
    return true;
  } catch (e) {
    console.error("[TablePrinting] Erro ao imprimir comprovante:", e);
    return false;
  }
}

export async function forceTestPrint() {
  try {
    const { data: printers } = await supabase.from("printers").select("*").limit(1);

    if (!printers || printers.length === 0) {
      console.warn("[TablePrinting] Nenhuma impressora ativa para teste.");
      return false;
    }

    const printer = printers[0];
    const { error } = await supabase.from("printing_jobs").insert([{
      printer_id: printer.id,
      status: "pending",
      copies: printer.copies,
      content: JSON.stringify({
        order_number: "TESTE MESA",
        customer_name: "TESTE MANUAL",
        items: [{ name: "PRODUTO TESTE", quantity: 1, price: 0 }],
        created_at: new Date().toISOString(),
        sector_name: "TESTE",
        waiter_name: "SISTEMA",
        total: 0,
      }),
    } as any]);

    if (error) { console.error("[TablePrinting] Erro no teste:", error); return false; }
    console.log("[TablePrinting] Job de teste inserido com sucesso!");
    return true;
  } catch (e) {
    console.error("[TablePrinting] Erro crítico no forceTestPrint:", e);
    return false;
  }
}