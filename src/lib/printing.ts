import { supabase } from "@/integrations/supabase/client";
import { createPrintJob } from "@/lib/printing-jobs";

/**
 * Processa a impressão de um pedido, gerando os trabalhos na fila (printing_jobs)
 * baseados nas configurações de setores, impressoras e vínculos de categoria.
 */
export async function processPrintingForOrder(orderId: string) {
  try {
    console.log(`[Printing] Iniciando processamento para pedido: ${orderId}`);
    
    // Verificar se já existem jobs para este pedido para evitar duplicidade
    const { data: existingJobs } = await supabase
      .from("printing_jobs")
      .select("id")
      .limit(1);

    if (existingJobs && existingJobs.length > 0) {
      console.log(`[Printing] Pedido ${orderId} já possui jobs de impressão. Pulando.`);
      return;
    }

    
    // 1. Buscar o pedido e seus itens
    const { data: order, error: orderError } = await supabase
      .from("delivery_orders")
      .select(`
        *,
        delivery_order_items (
          *,
          products (
            category_id
          )
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("[Printing] Erro ao buscar pedido:", orderError);
      return;
    }

    // 2. Buscar configurações de impressão
    const printersRes = await supabase.from("printers").select("*");
    const sectorsRes = await supabase.from("printer_sectors").select("*");
    const mappingsRes = await supabase.from("category_printer_mappings").select("*");

    const printers = printersRes.data || [];
    const sectors = sectorsRes.data || [];
    const mappings = mappingsRes.data || [];

    // 3. Buscar configurações de centralização
    const { data: storeSettings } = await supabase.from("store_settings").select("centralized_printing").single();
    const isCentralized = storeSettings?.centralized_printing === true;

    // 4. Processar cada setor
    if (isCentralized) {
      const caixaSector = sectors.find(s => s.name === 'caixa' || s.name === 'delivery');
      const caixaPrinters = printers.filter(p => p.sector_id === caixaSector?.id || p.name.toUpperCase().includes('CAIXA') || p.name.toUpperCase().includes('PDF') || p.name.toUpperCase().includes('VIRTUAL'));
      
      const printer = caixaPrinters[0] || printers[0];

      if (printer) {
        const printContent = {
          order_number: order.id.slice(-4).toUpperCase(),
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          order_type: order.order_type,
          notes: order.notes,
          items: order.delivery_order_items.map(item => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
            complements: item.selected_complements || []
          })),
          total: order.total_amount,
          created_at: order.created_at,
          sector_name: "CAIXA/DELIVERY",
          printing_type: 'full'
        };

        await createPrintJob({
          printer_id: printer.id,
          status: 'pending',
          copies: printer.copies,
          content: JSON.stringify(printContent)
        });
        console.log(`[Printing] Job centralizado criado para impressora ${printer.name}`);
      }
    } else {
      for (const sector of sectors) {
        // if (!sector.auto_print) continue;

        let itemsToPrint = [];
        
        if (sector.name === 'caixa' || sector.name === 'delivery') {
          itemsToPrint = order.delivery_order_items;
        } else {
          const linkedCategoryIds = mappings
            .filter(m => m.sector_id === sector.id)
            .map(m => m.category_id);
          
          itemsToPrint = order.delivery_order_items.filter(item => {
            const categoryId = (item.products as any)?.category_id;
            return categoryId && linkedCategoryIds.includes(categoryId);
          });
        }

        if (itemsToPrint.length === 0 && sector.name !== 'caixa') continue;

        const sectorPrinters = printers.filter(p => p.sector_id === sector.id);
        
        for (const printer of sectorPrinters) {
          // if (!printer.auto_print) continue;

          const printContent = {
            order_number: order.id.slice(-4).toUpperCase(),
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_address: order.customer_address,
            order_type: order.order_type,
            notes: order.notes,
            items: itemsToPrint.map(item => ({
              name: item.product_name,
              quantity: item.quantity,
              price: item.unit_price,
              complements: item.selected_complements || []
            })),
            total: order.total_amount,
            created_at: order.created_at,
            sector_name: sector.name,
            printing_type: 'full'
          };

          await createPrintJob({
            printer_id: printer.id,
            status: 'pending',
            copies: printer.copies,
            content: JSON.stringify(printContent)
          });

          console.log(`[Printing] Job criado para impressora ${printer.name} (Setor: ${sector.name})`);
        }
      }
    }

  } catch (error) {
    console.error("[Printing] Erro crítico no processamento:", error);
  }
}
