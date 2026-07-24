import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Bike, MapPin, Package } from "lucide-react";

// Dynamic leaflet import (client only)
let L: typeof import("leaflet") | null = null;

interface DispatchOrder {
  id: string;
  order_number?: string | null;
  customer_name?: string | null;
  customer_address?: string | null;
  neighborhood?: string | null;
  customer_lat?: number | null;
  customer_lng?: number | null;
  order_type?: string | null;
  status: string;
  driver_id?: string | null;
  created_at: string;
  ready_at?: string | null;
}

interface DispatchDriver {
  id: string;
  name: string;
  active?: boolean;
  motoqueiro_lat?: number | null;
  motoqueiro_lng?: number | null;
}

interface Props {
  storeSettings?: any;
  assignMotoqueiroToOrder: (orderId: string, driverId: string) => Promise<void>;
}

// Wait-time thresholds in minutes
const WAIT_YELLOW = 10;
const WAIT_RED = 20;

function waitColor(minutes: number): { bg: string; hex: string; label: string } {
  if (minutes >= WAIT_RED) return { bg: "bg-red-500", hex: "#ef4444", label: "atrasado" };
  if (minutes >= WAIT_YELLOW) return { bg: "bg-yellow-500", hex: "#eab308", label: "atenção" };
  return { bg: "bg-green-500", hex: "#22c55e", label: "no prazo" };
}

function loadCountColor(count: number): string {
  if (count === 0) return "bg-green-500";
  if (count === 1) return "bg-yellow-500";
  return "bg-red-500";
}

function originLabel(orderType?: string | null): string {
  switch (orderType) {
    case "delivery":
      return "Delivery";
    case "pickup":
      return "Retirada";
    case "counter":
      return "Balcão";
    case "dine_in":
      return "Mesa";
    default:
      return "Local";
  }
}

function FlyTo({ target }: { target: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 16, { duration: 0.6 });
  }, [target, map]);
  return null;
}

export function DispatchCenter({ storeSettings, assignMotoqueiroToOrder }: Props) {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [drivers, setDrivers] = useState<DispatchDriver[]>([]);
  const [driverLoads, setDriverLoads] = useState<Record<string, number>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const iconCache = useRef<Record<string, any>>({});

  const storeLat = Number(storeSettings?.latitude) || -23.5505;
  const storeLng = Number(storeSettings?.longitude) || -46.6333;

  // Load leaflet
  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      if (!L) {
        L = await import("leaflet");
        const iconUrl = (await import("leaflet/dist/images/marker-icon.png")).default;
        const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png")).default;
        L.Marker.prototype.options.icon = L.icon({
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
      }
      setLeafletReady(true);
    })();
  }, []);

  // Ticker for wait times
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("delivery_orders")
      .select("*")
      .eq("status", "ready")
      .is("driver_id", null)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("[Dispatch] load orders", error);
      return;
    }
    setOrders((data as any) || []);
  }, []);

  const loadDrivers = useCallback(async () => {
    const { data, error } = await (supabase.from as any)("drivers")
      .select("*")
      .order("name");
    if (error) {
      console.error("[Dispatch] load drivers", error);
      return;
    }
    const list = (data || []).filter((d: any) => d.is_active !== false && d.active !== false);
    setDrivers(list as any);
  }, []);

  const loadDriverLoads = useCallback(async () => {
    const { data, error } = await (supabase.from as any)("delivery_orders")
      .select("driver_id, status, driver_status")
      .eq("status", "delivering")
      .not("driver_id", "is", null);
    if (error) {
      console.error("[Dispatch] load loads", error);
      return;
    }
    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => {
      const ds = r.driver_status;
      if (ds && !["aguardando", "a_caminho"].includes(ds)) return;
      if (r.driver_id) counts[r.driver_id] = (counts[r.driver_id] || 0) + 1;
    });
    setDriverLoads(counts);
  }, []);

  useEffect(() => {
    loadOrders();
    loadDrivers();
    loadDriverLoads();
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  // Polling fallback (garante atualização mesmo sem Realtime configurado no banco)
  useEffect(() => {
    const t = setInterval(() => {
      loadOrders();
      loadDrivers();
      loadDriverLoads();
    }, 5000);
    return () => clearInterval(t);
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  // Refresh quando a aba/janela volta a ficar visível
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        loadOrders();
        loadDrivers();
        loadDriverLoads();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel(`dispatch-center-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_orders" },
        () => {
          loadOrders();
          loadDriverLoads();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "drivers" },
        (payload) => {
          loadDrivers();
          const n: any = payload.new;
          if (n?.id) {
            setDrivers((prev) =>
              prev.map((d) =>
                d.id === n.id
                  ? { ...d, motoqueiro_lat: n.motoqueiro_lat, motoqueiro_lng: n.motoqueiro_lng }
                  : d
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("[Dispatch] realtime status:", status);
      });
    return () => {
      supabase.removeChannel(ch);
    };
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  const enrichedOrders = useMemo(() => {
    return orders.map((o) => {
      const ref = o.ready_at || o.created_at;
      const minutes = Math.max(0, Math.floor((now - new Date(ref).getTime()) / 60000));
      return { ...o, waitMinutes: minutes, wait: waitColor(minutes) };
    });
  }, [orders, now]);

  const selectedOrder = enrichedOrders.find((o) => o.id === selectedOrderId) || null;

  const handleAssign = async (driverId: string) => {
    if (!selectedOrderId) {
      toast.error("Selecione um pedido na coluna da esquerda primeiro.");
      return;
    }
    try {
      await assignMotoqueiroToOrder(selectedOrderId, driverId);
      setSelectedOrderId(null);
      loadOrders();
      loadDriverLoads();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectOrder = (o: DispatchOrder) => {
    setSelectedOrderId(o.id);
    if (o.customer_lat && o.customer_lng) {
      setFlyTarget({ lat: Number(o.customer_lat), lng: Number(o.customer_lng) });
    }
  };

  // Build divIcons on demand
  const getOrderIcon = (hex: string, selected: boolean) => {
    if (!L) return undefined;
    const key = `o-${hex}-${selected ? 1 : 0}`;
    if (iconCache.current[key]) return iconCache.current[key];
    const size = selected ? 44 : 34;
    const icon = L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${hex};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:${
        selected ? 18 : 14
      }px;">📦</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: "dispatch-order-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  const getDriverIcon = () => {
    if (!L) return undefined;
    const key = "driver";
    if (iconCache.current[key]) return iconCache.current[key];
    const icon = L.divIcon({
      html: `<div style="width:38px;height:38px;background:#1e40af;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:20px;">🛵</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      className: "dispatch-driver-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  const getStoreIcon = () => {
    if (!L) return undefined;
    const key = "store";
    if (iconCache.current[key]) return iconCache.current[key];
    const icon = L.divIcon({
      html: `<div style="width:38px;height:38px;background:#f59e0b;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:20px;">🏪</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      className: "dispatch-store-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  return (
    <div className="h-[calc(100vh-140px)] w-full grid gap-3" style={{ gridTemplateColumns: "260px 1fr 260px" }}>
      {/* LEFT: Orders to dispatch */}
      <div className="flex flex-col bg-card border border-orange-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b bg-orange-50/60 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-black text-orange-900 uppercase">Para despachar</h3>
          <span className="ml-auto text-xs font-bold text-orange-700">{enrichedOrders.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {enrichedOrders.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">Nenhum pedido pronto aguardando entregador.</div>
          )}
          {enrichedOrders.map((o) => {
            const selected = selectedOrderId === o.id;
            const numLabel = o.order_number || `#${o.id.slice(0, 6).toUpperCase()}`;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => handleSelectOrder(o)}
                className={cn(
                  "w-full text-left rounded-lg border p-2.5 transition-all bg-white hover:shadow-md",
                  selected
                    ? "border-orange-500 ring-2 ring-orange-300 bg-orange-50"
                    : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("w-2.5 h-2.5 rounded-full", o.wait.bg)} />
                  <span className="text-xs font-black text-slate-900">
                    {String(numLabel).startsWith("#") ? numLabel : `#${numLabel}`}
                  </span>
                  <span className="ml-auto text-[10px] font-bold uppercase text-slate-500">
                    {originLabel(o.order_type)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 truncate">
                  {o.neighborhood || o.customer_address || o.customer_name || "Sem endereço"}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className={cn("text-[10px] font-bold text-white px-1.5 py-0.5 rounded", o.wait.bg)}>
                    {o.waitMinutes}min
                  </span>
                  {!o.customer_lat && (
                    <span className="text-[10px] text-slate-400 italic">sem GPS</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER: Map */}
      <div className="rounded-xl overflow-hidden border border-orange-100 shadow-sm relative bg-slate-100">
        {leafletReady ? (
          <MapContainer
            center={[storeLat, storeLng]}
            zoom={13}
            className="w-full h-full"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo target={flyTarget} />

            {/* Store marker */}
            <Marker position={[storeLat, storeLng]} icon={getStoreIcon() as any} />

            {/* Order markers */}
            {enrichedOrders
              .filter((o) => o.customer_lat && o.customer_lng)
              .map((o) => (
                <Marker
                  key={o.id}
                  position={[Number(o.customer_lat), Number(o.customer_lng)]}
                  icon={getOrderIcon(o.wait.hex, selectedOrderId === o.id) as any}
                  eventHandlers={{
                    click: () => handleSelectOrder(o),
                  }}
                />
              ))}

            {/* Driver markers */}
            {drivers
              .filter((d) => d.motoqueiro_lat && d.motoqueiro_lng)
              .map((d) => (
                <Marker
                  key={d.id}
                  position={[Number(d.motoqueiro_lat), Number(d.motoqueiro_lng)]}
                  icon={getDriverIcon() as any}
                />
              ))}
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            Carregando mapa...
          </div>
        )}
      </div>

      {/* RIGHT: Available drivers */}
      <div className="flex flex-col bg-card border border-orange-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b bg-orange-50/60 flex items-center gap-2">
          <Bike className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-black text-orange-900 uppercase">Motoqueiros</h3>
          <span className="ml-auto text-xs font-bold text-orange-700">{drivers.length}</span>
        </div>
        {selectedOrder && (
          <div className="px-3 py-2 bg-orange-100/70 border-b text-[11px] text-orange-900 font-bold">
            Despachar pedido{" "}
            <span className="font-black">
              #{(selectedOrder.order_number || selectedOrder.id.slice(0, 6)).toString().toUpperCase()}
            </span>
            — clique num motoqueiro
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {drivers.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">Nenhum motoqueiro ativo.</div>
          )}
          {drivers.map((d) => {
            const load = driverLoads[d.id] || 0;
            const color = loadCountColor(load);
            const canClick = !!selectedOrderId;
            return (
              <button
                key={d.id}
                type="button"
                disabled={!canClick}
                onClick={() => handleAssign(d.id)}
                className={cn(
                  "w-full text-left rounded-lg border p-2.5 flex items-center gap-2 transition-all bg-white",
                  canClick
                    ? "border-slate-200 hover:border-orange-500 hover:shadow-md cursor-pointer"
                    : "border-slate-100 opacity-60 cursor-not-allowed"
                )}
              >
                <Bike className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 truncate flex-1">{d.name}</span>
                <span
                  className={cn(
                    "text-[10px] font-black text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    color
                  )}
                  title={`${load} pedido(s) em andamento`}
                >
                  {load}
                </span>
                {d.motoqueiro_lat && d.motoqueiro_lng && (
                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
