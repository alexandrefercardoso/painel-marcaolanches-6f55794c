import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bike,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Camera,
  Loader2,
} from "lucide-react";

interface DeliveryRow {
  id: string;
  order_number: string | null;
  delivery_address: string | null;
  driver_id: string | null;
  driver_status: string | null;
  delivery_started_at: string | null;
  delivered_at: string | null;
  delivery_proof_url: string | null;
  customer_name?: string | null;
  driver?: { id: string; full_name: string | null; email: string | null } | null;
}

interface Props {
  /** Minutos após os quais o cronômetro fica em alerta (amarelo/vermelho). */
  alertThresholdMin?: number;
}

const timeSince = (iso: string | null) => {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
};

const fmtTime = (iso: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

export function LiveDeliveriesPanel({ alertThresholdMin = 20 }: Props) {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [detail, setDetail] = useState<DeliveryRow | null>(null);
  const [leaving, setLeaving] = useState<Record<string, boolean>>({});
  const rowsRef = useRef<DeliveryRow[]>([]);
  rowsRef.current = rows;

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from("delivery_orders")
      .select(
        "id, order_number, delivery_address, driver_id, driver_status, delivery_started_at, delivered_at, delivery_proof_url, customer_name"
      )
      .eq("driver_status", "a_caminho")
      .order("delivery_started_at", { ascending: true, nullsFirst: true })
      .limit(100);

    if (error) {
      toast.error("Erro ao carregar entregas em andamento");
      setLoading(false);
      return;
    }

    const list = (data as DeliveryRow[]) || [];
    const driverIds = Array.from(
      new Set(list.map((r) => r.driver_id).filter(Boolean))
    ) as string[];

    let driversMap: Record<string, { id: string; full_name: string | null; email: string | null }> = {};
    if (driverIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", driverIds)
        .limit(driverIds.length);
      (profs || []).forEach((p: any) => (driversMap[p.id] = p));
    }

    setRows(
      list.map((r) => ({
        ...r,
        driver: r.driver_id ? driversMap[r.driver_id] || null : null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const tick = setInterval(() => setNow(Date.now()), 30_000);

    const channel = supabase
      .channel("admin_live_deliveries")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "delivery_orders" },
        (payload: any) => {
          const newRow = payload.new as DeliveryRow;
          const oldRow = payload.old as DeliveryRow;

          // Ficou/entrou em rota → recarrega
          if (newRow.driver_status === "a_caminho") {
            fetchAll();
            return;
          }

          // Saiu de a_caminho (ex: entregue) → animação + toast
          if (
            oldRow?.driver_status === "a_caminho" &&
            newRow.driver_status !== "a_caminho"
          ) {
            const existing = rowsRef.current.find((r) => r.id === newRow.id);
            if (!existing) return;

            setLeaving((prev) => ({ ...prev, [newRow.id]: true }));

            if (newRow.driver_status === "entregue") {
              toast.success(
                `Pedido #${
                  existing.order_number || newRow.id.slice(0, 6)
                } entregue por ${
                  existing.driver?.full_name || "entregador"
                } às ${fmtTime(newRow.delivered_at)}`,
                { icon: "🎉" }
              );
            }

            setTimeout(() => {
              setRows((prev) => prev.filter((r) => r.id !== newRow.id));
              setLeaving((prev) => {
                const copy = { ...prev };
                delete copy[newRow.id];
                return copy;
              });
            }, 700);
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(tick);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          new Date(a.delivery_started_at || 0).getTime() -
          new Date(b.delivery_started_at || 0).getTime()
      ),
    [rows]
  );

  return (
    <Card className="border-emerald-100 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-emerald-900">
                Entregas em Andamento
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Pedidos a caminho — atualização em tempo real
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">
            {sorted.length} ativo(s)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando entregas...
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Nenhuma entrega em andamento</p>
            <p className="text-xs">
              Assim que um entregador iniciar a rota, o pedido aparece aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {sorted.map((r) => {
              const mins = timeSince(r.delivery_started_at);
              const isLate = mins >= alertThresholdMin;
              const isWarn = mins >= Math.floor(alertThresholdMin * 0.75) && !isLate;
              const isLeaving = leaving[r.id];

              return (
                <div
                  key={r.id}
                  className={`relative border rounded-xl p-4 bg-white transition-all duration-500 ${
                    isLeaving
                      ? "opacity-0 scale-95 translate-y-1"
                      : "opacity-100 scale-100 hover:shadow-md"
                  } ${
                    isLate
                      ? "border-red-300 bg-red-50/40"
                      : isWarn
                      ? "border-yellow-300 bg-yellow-50/40"
                      : "border-emerald-100"
                  }`}
                >
                  {isLeaving && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-in zoom-in duration-300" />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base text-slate-900">
                          #{r.order_number || r.id.slice(0, 6)}
                        </span>
                        {r.customer_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            · {r.customer_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-slate-700">
                        <Bike className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-semibold truncate">
                          {r.driver?.full_name || r.driver?.email || "Entregador"}
                        </span>
                      </div>
                    </div>

                    <Badge
                      className={`gap-1 whitespace-nowrap ${
                        isLate
                          ? "bg-red-600 hover:bg-red-700"
                          : isWarn
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      } text-white`}
                    >
                      <Clock className="h-3 w-3" />
                      {r.delivery_started_at
                        ? `a caminho há ${mins} min`
                        : "iniciando..."}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-1.5 text-[12px] text-slate-600 mb-3">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {r.delivery_address || "Endereço não informado"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      Início: {fmtTime(r.delivery_started_at)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setDetail(r)}
                    >
                      Rastreio
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Suppress unused var warning for `now` — used to force re-render */}
        <span className="hidden">{now}</span>
      </CardContent>

      <TrackingDialog detail={detail} onClose={() => setDetail(null)} />
    </Card>
  );
}

function TrackingDialog({
  detail,
  onClose,
}: {
  detail: DeliveryRow | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!detail} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-emerald-600" />
            Rastreio da Entrega
          </DialogTitle>
        </DialogHeader>
        {detail && (
          <div className="space-y-3 text-sm">
            <Row label="Pedido" value={`#${detail.order_number || detail.id.slice(0, 6)}`} />
            <Row
              label="Entregador"
              value={detail.driver?.full_name || detail.driver?.email || "—"}
            />
            <Row label="Endereço" value={detail.delivery_address || "—"} />
            <Row label="Início da rota" value={fmtTime(detail.delivery_started_at)} />
            <Row
              label="Entregue às"
              value={detail.delivered_at ? fmtTime(detail.delivered_at) : "em andamento"}
            />
            {detail.delivery_proof_url && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" /> Comprovação de entrega
                </p>
                <a
                  href={detail.delivery_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden border hover:opacity-90 transition"
                >
                  <img
                    src={detail.delivery_proof_url}
                    alt="Comprovação"
                    className="w-full h-40 object-cover"
                  />
                </a>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-slate-100 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}
