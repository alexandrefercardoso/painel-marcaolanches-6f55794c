import { cn } from "@/lib/utils";

interface SystemVersionProps {
  className?: string;
}

export function SystemVersion({ className }: SystemVersionProps) {
  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
  const buildIso = typeof __APP_BUILD_DATE__ !== "undefined" ? __APP_BUILD_DATE__ : new Date().toISOString();
  const formatted = new Date(buildIso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "text-[11px] sm:text-xs text-muted-foreground leading-tight text-center",
        className,
      )}
    >
      <div className="font-medium">Versão {version}</div>
      <div>Liberado em {formatted}</div>
    </div>
  );
}
