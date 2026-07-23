
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

// Dedupe cross-mount: evita que múltiplas instâncias/assinaturas do monitor
// processem o mesmo job (o que causava sobrescrita de 'printed' -> 'error').
const processedJobIds = new Set<string>();
const processingJobIds = new Set<string>();

function normalizePrintContent(rawContent: any) {
  if (!rawContent) return {};
  if (typeof rawContent === 'string') {
    try {
      return JSON.parse(rawContent);
    } catch {
      return { text: rawContent, items: [] };
    }
  }
  return rawContent;
}

export function GlobalPrinterMonitor() {
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAutoPrint = async (content: any, printerName: string, copies: number = 1) => {
    let printFrame = document.getElementById('silent-print-frame') as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'silent-print-frame';
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);
    }

    const { gerarHtmlImpressao } = await import('@/lib/print-template');
    const { data: storeSettings } = await supabase
      .from('store_settings')
      .select('print_paper_format')
      .maybeSingle();

    const formato = ((storeSettings as any)?.print_paper_format || 'thermal_80mm') as 'a4' | 'thermal_80mm';

    // Remove o auto-print embutido no template; vamos disparar manualmente N vezes
    // conforme a quantidade de vias configurada na impressora.
    const htmlContent = gerarHtmlImpressao({
      titulo: `PEDIDO${content.order_number ? `: ${content.order_number}` : ''}`,
      formato,
      content: {
        order_number: content.order_number,
        customer_name: content.customer_name,
        waiter_name: content.waiter_name,
        sector_name: content.sector_name || 'COZINHA',
        notes: content.notes,
        total: content.total,
        created_at: content.created_at,
        items: content.items,
      },
      rodapePersonalizado: `*** ${printerName} ***`,
    }).replace('window.onload = () => window.print();', '');

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    const totalCopies = Math.max(1, Number(copies) || 1);
    const printOnce = () =>
      new Promise<void>((resolve) => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch (e) {
          console.error('[GlobalPrinterMonitor] Falha ao imprimir via iframe:', e);
        }
        // pequeno intervalo entre vias para o driver aceitar cópias sequenciais
        setTimeout(resolve, 600);
      });

    // aguarda o conteúdo carregar antes da primeira via
    await new Promise<void>((resolve) => setTimeout(resolve, 200));
    for (let i = 0; i < totalCopies; i++) {
      await printOnce();
    }
  };



  const processPrintJob = useCallback(async (job: any, source: 'realtime' | 'polling' = 'realtime') => {
    if (!job?.id) return;

    if (processedJobIds.has(job.id) || processingJobIds.has(job.id)) {
      console.log(`[GlobalPrinterMonitor] Job ${job.id} já processado/em processamento nesta sessão. Ignorando.`);
      return;
    }

    processingJobIds.add(job.id);
    const content = normalizePrintContent(job.content);
    console.log(`🖨️ [GlobalPrinterMonitor] Processando job via ${source}:`, { ...job, content });

    toast.info("Impressão detectada!", {
      icon: "🖨️",
      description: content?.order_number ? `Pedido: ${content.order_number}` : undefined
    });

    const markPrinted = async () => {
      const { error } = await supabase
        .from('printing_jobs')
        .update({ status: 'printed', error_message: null })
        .eq('id', job.id);
      if (error) throw error;
      processedJobIds.add(job.id);
    };

    const markError = async (message: string) => {
      await supabase
        .from('printing_jobs')
        .update({ status: 'error', error_message: message })
        .eq('id', job.id);
      processedJobIds.add(job.id);
    };

    try {
      const { data: printer, error: printerError } = await supabase
        .from("printers")
        .select("connection_type, show_preview, name, auto_print, auto_browser_print, copies")
        .eq("id", job.printer_id)
        .maybeSingle();

      if (printerError) {
        console.warn("[GlobalPrinterMonitor] Erro ao buscar detalhes da impressora:", printerError);
      }

      const printerName = printer?.name || "Monitor Virtual (Sistema)";
      const connectionType = String(printer?.connection_type || 'virtual').toLowerCase();
      const autoPrint = printer?.auto_browser_print === true || printer?.auto_print === true;
      const showPreview = printer?.show_preview !== false || !printer || printerName.toUpperCase().includes("PDF") || printerName.toUpperCase().includes("VIRTUAL");

      // Fonte única da verdade: usar o número de cópias gravado no job no
      // momento da criação. Fallback para 1 se ausente.
      const jobCopies = Math.max(1, Number((job as any).copies) || 1);

      console.log(`[GlobalPrinterMonitor] Impressora: ${printerName}. Tipo: ${connectionType}. Auto: ${autoPrint}. Preview: ${showPreview}. Cópias(job): ${jobCopies}`);

      if (connectionType === 'qz_tray') {
        try {
          const { gerarHtmlImpressao } = await import('@/lib/print-template');
          const { data: storeSettings } = await supabase
            .from('store_settings')
            .select('print_paper_format')
            .maybeSingle();

          const formato = ((storeSettings as any)?.print_paper_format || 'thermal_80mm') as 'a4' | 'thermal_80mm';

          const htmlContent = gerarHtmlImpressao({
            titulo: `PEDIDO${content?.order_number ? `: ${content.order_number}` : ''}`,
            formato,
            content,
            rodapePersonalizado: `*** ${printerName} ***`,
          });

          const { printViaQZ } = await import('@/lib/qz-tray');
          await printViaQZ({
            printerName,
            htmlContent,
            copies: jobCopies,
          });

          await markPrinted();
          toast.success(`Impresso em ${printerName}`);
        } catch (err: any) {
          console.error('[GlobalPrinterMonitor] Erro QZ Tray:', err);

          // Só marca como 'error' se o job ainda não tiver sido marcado como 'printed'.
          // Isso evita que erros tardios/duplicados do QZ Tray (ex.: "Cannot find printer"
          // vindo de uma segunda tentativa) sobrescrevam uma impressão já bem-sucedida.
          const { data: current } = await supabase
            .from('printing_jobs')
            .select('status')
            .eq('id', job.id)
            .maybeSingle();

          if (current?.status === 'printed') {
            console.warn('[GlobalPrinterMonitor] Job já estava como "printed"; ignorando erro tardio do QZ.');
            processedJobIds.add(job.id);
            return;
          }

          await markError(err?.message || 'Erro ao imprimir via QZ Tray');
          toast.error(`Falha ao imprimir em ${printerName}: ${err?.message || 'Erro desconhecido'}`);
        }
        return;
      }

      if (autoPrint) {
        await handleAutoPrint(content, printerName, jobCopies);
        await markPrinted();
        return;
      }

      // Se não for QZ e não estiver em auto-print, sempre abre preview como fallback.
      // Isso evita job parado como PENDENTE quando a impressora está TCP/WiFi/USB,
      // pois navegador web não imprime direto nessas conexões sem QZ/bridge local.
      if (showPreview || !autoPrint) {
        console.log("📄 [GlobalPrinterMonitor] Abrindo preview para:", content?.order_number);
        setPreviewContent({ ...content, printer_name: printerName });
        setIsOpen(true);
        await markPrinted();
      }

    } catch (err: any) {
      console.error("[GlobalPrinterMonitor] Erro crítico no processamento do job:", err);
      await markError(err?.message || 'Erro crítico ao processar impressão');
    } finally {
      processingJobIds.delete(job.id);
    }
  }, []);

  useEffect(() => {
    console.log("[GlobalPrinterMonitor] Iniciando monitoramento global de impressão.");
    
    const channel = supabase
      .channel('global_printing_monitor')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'printing_jobs'
      }, async (payload) => {
        await processPrintJob(payload.new, 'realtime');
      })
      .subscribe((status) => {
        console.log("[GlobalPrinterMonitor] Status da assinatura Realtime:", status);
      });

    // Fallback: se o Realtime perder o INSERT ou o monitor iniciar depois do job,
    // busca jobs recentes pendentes e processa. Corrige histórico preso em PENDENTE.
    const pendingJobsInterval = window.setInterval(async () => {
      try {
        const recentCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const { data: pendingJobs, error } = await supabase
          .from('printing_jobs')
          .select('*')
          .eq('status', 'pending')
          .gte('created_at', recentCutoff)
          .order('created_at', { ascending: true })
          .limit(5);

        if (error) {
          console.warn('[GlobalPrinterMonitor] Erro ao buscar pendentes:', error);
          return;
        }

        for (const pendingJob of pendingJobs || []) {
          await processPrintJob(pendingJob, 'polling');
        }
      } catch (err) {
        console.warn('[GlobalPrinterMonitor] Falha no polling de pendentes:', err);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(pendingJobsInterval);
    };
  }, [processPrintJob]);

  if (!previewContent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Preview de Impressão - {previewContent.printer_name}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-white p-4 text-black font-mono text-sm border-2 border-dashed border-gray-300 rounded shadow-inner">
          <div className="text-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">CUPOM DE PEDIDO</h2>
            <p>#{previewContent.order_number}</p>
            <p>{new Date(previewContent.created_at).toLocaleString('pt-BR')}</p>
          </div>

          <div className="mb-4">
            <p><strong>CLIENTE:</strong> {previewContent.customer_name || "Mesa"}</p>
          </div>

          <div className="mb-4">
            <p className="border-b mb-1"><strong>ITENS:</strong></p>
            {previewContent.items?.map((item: any, idx: number) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between font-bold">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                </div>
                {item.complements?.length > 0 && (
                  <div className="pl-4 text-xs text-gray-600">
                    {item.complements.map((c: any, cidx: number) => (
                      <div key={cidx}>+ {c.name || (typeof c === 'string' ? c : c.nome)}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-2 text-right">
            <p className="text-lg font-bold">TOTAL: R$ {Number(previewContent.total || 0).toFixed(2)}</p>
          </div>

          {previewContent.notes && (
            <div className="mt-4 p-2 bg-gray-50 border rounded text-xs">
              <p><strong>OBSERVAÇÕES:</strong></p>
              <p>{previewContent.notes}</p>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            <p className="mb-2">Setor: {previewContent.sector_name}</p>
            <div className="pt-2 border-t border-dashed">
              <a 
                href="https://www.meupedix.com.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-[10px]"
              >
                www.meupedix.com.br
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsOpen(false)}>Fechar Preview</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
