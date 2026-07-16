import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop");

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setPlatform("android");
    else if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else setPlatform("desktop");

    // Check if already installed
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: any) => {
      console.log("PWA: beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto show for Android/Desktop if prompt available
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Auto show for iOS after 2 seconds
    if (/iphone|ipad|ipod/.test(ua) && !(window.navigator as any).standalone) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (platform === "ios") {
      setShowIOSPrompt(true);
      return;
    }

    if (!deferredPrompt) {
      toast.info("Para instalar, use a opção 'Instalar Aplicativo' no menu do seu navegador.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
      toast.success("Obrigado por instalar nosso aplicativo!");
    }
  };

  if (isStandalone || !isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 lg:bottom-8 lg:left-auto lg:right-8 lg:w-80">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-lg ring-1 ring-black/5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1 overflow-hidden text-left">
            <h3 className="truncate text-sm font-bold">Instalar Aplicativo</h3>
            <p className="truncate text-[11px] text-muted-foreground">
              {platform === "ios" ? "Toque para ver como instalar" : "Tenha uma experiência nativa e rápida."}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button size="sm" onClick={handleInstallClick} className="font-bold h-8 px-3 text-xs">
              Instalar
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showIOSPrompt} onOpenChange={setShowIOSPrompt}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-2">
                <Download className="h-6 w-6" />
              </div>
              Instalar no iPhone
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              Siga os passos abaixo para adicionar o app à sua tela de início:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-black text-sm shadow-sm">1</div>
              <p className="text-sm font-medium">Toque no ícone de <span className="inline-flex items-center bg-white p-1 rounded border shadow-sm mx-1"><Share className="h-4 w-4 text-blue-500" /></span> (Compartilhar) no menu do Safari.</p>
            </div>
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-black text-sm shadow-sm">2</div>
              <p className="text-sm font-medium">Role a lista para baixo e toque em <span className="font-black text-primary italic">"Adicionar à Tela de Início"</span>.</p>
            </div>
            <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-black text-sm shadow-sm">3</div>
              <p className="text-sm font-medium">Confirme tocando em <span className="font-black">"Adicionar"</span> no canto superior direito.</p>
            </div>
          </div>
          <Button onClick={() => {setShowIOSPrompt(false); setIsVisible(false);}} className="w-full h-12 font-black rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
            ENTENDIDO
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
