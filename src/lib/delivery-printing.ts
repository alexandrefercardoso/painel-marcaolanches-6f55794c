import { supabase } from "@/integrations/supabase/client";
import { createPrintJob } from "@/lib/printing-jobs";

// Deduplicação em memória por aba (evita múltiplos disparos do mesmo pedido
// vindos do realtime + criação manual + cliques repetidos na mesma sessão).
const recentlyQueued = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000;

function alreadyQueuedLocally(key: string): boolean {
  const now = Date.now();
  // limpa entradas antigas
  for (const [k, t] of recentlyQueued) {
    if (now - t > DEDUP_WINDOW_MS) recentlyQueued.delete(k);
  }
  if (recentlyQueued.has(key)) return true;
  recentlyQueued.set(key, now);
  return false;
}

export async function processPrintingForDeliveryOrder(orderId: string, isCancellation: boolean = false) {
  try {
    const dedupKey = `${orderId}:${isCancellation ? "cancel" : "full"}`;
    if (alreadyQueuedLocally(dedupKey)) {
      console.log(`[DeliveryPrinting] Ignorando duplicata local para ${dedupKey}`);
      return;
    }

    console.log(`[DeliveryPrinting] Iniciando para pedido: ${orderId}`);

    const { data: order, error: orderError } = await supabase
      .from("delivery_orders")
      .select("*, delivery_order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[DeliveryPrinting] Pedido não encontrado:", orderError);
      return;
    }

    // Buscar configurações
    const { data: printers } = await supabase
      .from("printers")
      .select("*")
      .eq("is_active", true);

    if (!printers || printers.length === 0) {
      console.warn("[DeliveryPrinting] Nenhuma impressora ativa.");
      return;
    }

    // 1. Job para o Caixa/Administrativo (Sempre gera preview se configurado)
    const adminPrinter = printers.find(p =>
      p.name.toUpperCase().includes("CAIXA") ||
      p.name.toUpperCase().includes("PDF") ||
      p.name.toUpperCase().includes("VIRTUAL")
    ) || printers[0];

    const orderNumber = (order as any).order_number || `DELIVERY-${orderId.slice(0, 6).toUpperCase()}`;
    const printingType = isCancellation ? "cancellation" : "full";

    // Dedup cross-tab: se algum outro cliente já enfileirou este pedido nos últimos
    // 60s (mesmo tipo/impressora), não enfileira de novo. Evita múltiplas vias quando
    // várias abas do admin recebem o mesmo evento realtime.
    const sinceIso = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
    const { data: existingJobs } = await supabase
      .from("printing_jobs")
      .select("id, content, created_at, printer_id")
      .eq("printer_id", adminPrinter.id)
      .gte("created_at", sinceIso);

    const alreadyExists = (existingJobs || []).some((j: any) => {
      const c = j.content || {};
      return c.order_number === orderNumber && (c.printing_type || "full") === printingType;
    });

    if (alreadyExists) {
      console.log(`[DeliveryPrinting] Job já existente para ${orderNumber} (${printingType}). Ignorando.`);
      return;
    }

    const content = {
      order_number: orderNumber,
      customer_name: order.customer_name || "Cliente",
      customer_phone: order.customer_phone || "",
      customer_address: (order as any).delivery_address || order.customer_address || "",
      order_type: "DELIVERY",
      notes: order.notes || "",
      total: order.total_amount || 0,
      created_at: new Date().toISOString(),
      sector_name: "DELIVERY",
      printing_type: printingType,
      is_cancellation: isCancellation,
      items: (order.delivery_order_items || []).map((item: any) => ({
        name: item.product_name || "Produto",
        quantity: item.quantity,
        price: item.unit_price,
        notes: item.notes || item.observations || "",
        complements: item.selected_complements || [],
      })),
    };

    const { error: adminError } = await createPrintJob({
      printer_id: adminPrinter.id,
      status: "pending",
      copies: Math.max(1, Number(adminPrinter.copies) || 1),
      content: JSON.stringify(content),
    });

    if (adminError) console.error("[DeliveryPrinting] Erro ao inserir job administrativo:", adminError);
    else console.log("[DeliveryPrinting] Job administrativo inserido com sucesso!");
  } catch (error) {
    console.error("[DeliveryPrinting] Erro crítico:", error);
  }
}
