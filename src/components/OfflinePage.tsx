import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflinePage() {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-lg ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-destructive/10 p-2">
          <WifiOff className="h-5 w-5 text-destructive" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold">Você está offline</p>
          <p className="text-xs text-muted-foreground">O conteúdo pode estar desatualizado</p>
        </div>
      </div>
      <Button 
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
        className="h-8 px-3 text-xs"
      >
        Atualizar
      </Button>
    </div>
  );
}
