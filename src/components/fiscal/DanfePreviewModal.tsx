// src/components/fiscal/DanfePreviewModal.tsx
// Pré-visualização da NFC-e/NF-e sem chamar o NuvemFiscal.
// Exportação default para uso com React.lazy.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { gerarHtmlDanfePreview, type DanfePreviewData } from "@/lib/print-template";
interface Props {
  orderId: string;
  tipo?: "NFCE" | "NFE";
  open: boolean;
  onOpenChange: (v: boolean) => void;
}
export default function DanfePreviewModal({ orderId, tipo = "NFCE", open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DanfePreviewData | null>(null);
  const [formato, setFormato] = useState<"a4" | "thermal_80mm">("a4");
  useEffect(() => {
    if (!open || !orderId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const res = await supabase.functions.invoke("fiscal-preview", {
          body: { orderId, tipo },
        });
        if (cancelled) return;
        if (res.error) throw new Error(res.error.message);
        const payload: any = res.data;
        if (!payload?.success) throw new Error(payload?.error || "Falha na prévia");
        setData(payload.data as DanfePreviewData);
      } catch (e: any) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, orderId, tipo]);
  function imprimir() {
    if (!data) return;
    const html = gerarHtmlDanfePreview(data, formato);
    const w = window.open("", "_blank", "width=900,height=1000");
    if (!w) {
      toast.error("Bloqueador de pop-up impediu abrir a prévia");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
  const previewHtml = data ? gerarHtmlDanfePreview(data, formato) : "";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
            
      <DialogContent className="max-w-4xl">
                
        <DialogHeader>
                    <DialogTitle>Pré-visualização da nota — {tipo}</DialogTitle>
                    
          <DialogDescription>
                        Documento simulado, <strong>sem valor fiscal</strong> e não transmitido à SEFAZ.           
          </DialogDescription>
                  
        </DialogHeader>
                
        <div className="flex items-center gap-2 mb-2">
                    
          <Button size="sm" variant={formato === "a4" ? "default" : "outline"} onClick={() => setFormato("a4")}>
                        A4           
          </Button>
                    
          <Button
            size="sm"
            variant={formato === "thermal_80mm" ? "default" : "outline"}
            onClick={() => setFormato("thermal_80mm")}
          >
                        80mm           
          </Button>
                  
        </div>
                
        <div className="border rounded-md bg-muted/20 h-[60vh] overflow-hidden">
                    
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                            
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Calculando prévia...             
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-600 gap-2">
                            
              <AlertTriangle className="h-4 w-4" /> {error}
                          
            </div>
          ) : (
            <iframe title="Prévia DANFE" className="w-full h-full bg-white" srcDoc={previewHtml} />
          )}
                  
        </div>
                
        <DialogFooter>
                    
          <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fechar           
          </Button>
                    
          <Button onClick={imprimir} disabled={!data || loading}>
                        
            <Printer className="h-4 w-4 mr-2" /> Imprimir prévia           
          </Button>
                  
        </DialogFooter>
              
      </DialogContent>
          
    </Dialog>
  );
}
