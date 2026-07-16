/**
 * O cancelamento é impresso através de `processPrintingForTableOrder` /
 * `processPrintingForDeliveryOrder` com `isCancellation = true`, que insere
 * jobs em `printing_jobs`. O `GlobalPrinterMonitor` então respeita as regras
 * da impressora (auto_browser_print, qz_tray, preview, setor, etc).
 *
 * Esta função foi mantida como no-op para preservar compatibilidade com os
 * componentes que ainda a chamam, evitando uma janela duplicada de preview
 * que ignorava as configurações da impressora.
 */
export async function showCancellationPreview(_data: {
  orderNumber: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
    complements?: any[];
  }>;
  waiterName?: string;
  type: 'table' | 'delivery';
}) {
  return true;
}
