import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Bike,
  MapPin,
  Package,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Clock,
  CheckCircle2,
  Navigation,
  Zap,
} from "lucide-react";

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

interface ActiveDelivery {
  id: string;
  order_number?: string | null;
  customer_name?: string | null;
  customer_address?: string | null;
  customer_lat?: number | null;
  customer_lng?: number | null;
  driver_id?: string | null;
  driver_status?: string | null;
  delivery_started_at?: string | null;
  driver_name?: string | null;
}

interface Props {
  storeSettings?: any;
  assignMotoqueiroToOrder: (orderId: string, driverId: string) => Promise<void>;
}

const WAIT_YELLOW = 10;
const WAIT_RED = 20;
const DELIVERY_ETA_MIN = 30; // rough ETA for progress bar

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
    case "delivery": return "Delivery";
    case "pickup": return "Retirada";
    case "counter": return "Balcão";
    case "dine_in": return "Mesa";
    default: return "Local";
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
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [tvMode, setTvMode] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [pulseDeliveryId, setPulseDeliveryId] = useState<string | null>(null);
  const iconCache = useRef<Record<string, any>>({});

  const storeLat = Number(storeSettings?.latitude) || -23.5505;
  const storeLng = Number(storeSettings?.longitude) || -46.6333;

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      if (!L) {
        L = await import("leaflet");
        const iconUrl = (await import("leaflet/dist/images/marker-icon.png")).default;
        const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png")).default;
        L.Marker.prototype.options.icon = L.icon({
          iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41],
        });
      }
      setLeafletReady(true);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ESC exits TV mode
  useEffect(() => {
    if (!tvMode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTvMode(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tvMode]);

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("delivery_orders")
      .select("*")
      .eq("status", "ready")
      .is("driver_id", null)
      .order("created_at", { ascending: true });
    if (error) { console.error("[Dispatch] load orders", error); return; }
    setOrders((data as any) || []);
  }, []);

  const loadDrivers = useCallback(async () => {
    const { data, error } = await (supabase.from as any)("drivers").select("*").order("name");
    if (error) { console.error("[Dispatch] load drivers", error); return; }
    const list = (data || []).filter((d: any) => d.is_active !== false && d.active !== false);
    setDrivers(list as any);
  }, []);

  const loadDriverLoads = useCallback(async () => {
    const { data, error } = await (supabase.from as any)("delivery_orders")
      .select("driver_id, status, driver_status")
      .eq("status", "delivering")
      .not("driver_id", "is", null);
    if (error) { console.error("[Dispatch] load loads", error); return; }
    const counts: Record<string, number> = {};
    (data || []).forEach((r: any) => {
      const ds = r.driver_status;
      if (ds && !["aguardando", "a_caminho"].includes(ds)) return;
      if (r.driver_id) counts[r.driver_id] = (counts[r.driver_id] || 0) + 1;
    });
    setDriverLoads(counts);
  }, []);

  const loadActiveDeliveries = useCallback(async () => {
    const { data, error } = await (supabase.from as any)("delivery_orders")
      .select("*")
      .eq("driver_status", "a_caminho")
      .order("delivery_started_at", { ascending: true });
    if (error) { console.error("[Dispatch] load active deliveries", error); return; }
    const list: ActiveDelivery[] = (data || []).map((r: any) => ({
      id: r.id,
      order_number: r.order_number,
      customer_name: r.customer_name,
      customer_address: r.customer_address,
      customer_lat: r.customer_lat,
      customer_lng: r.customer_lng,
      driver_id: r.driver_id,
      driver_status: r.driver_status,
      delivery_started_at: r.delivery_started_at,
    }));
    // Attach driver names from drivers state (best-effort)
    setActiveDeliveries(list);
  }, []);

  useEffect(() => {
    loadOrders(); loadDrivers(); loadDriverLoads(); loadActiveDeliveries();
  }, [loadOrders, loadDrivers, loadDriverLoads, loadActiveDeliveries]);

  useEffect(() => {
    const t = setInterval(() => {
      loadOrders(); loadDrivers(); loadDriverLoads(); loadActiveDeliveries();
    }, 5000);
    return () => clearInterval(t);
  }, [loadOrders, loadDrivers, loadDriverLoads, loadActiveDeliveries]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        loadOrders(); loadDrivers(); loadDriverLoads(); loadActiveDeliveries();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [loadOrders, loadDrivers, loadDriverLoads, loadActiveDeliveries]);

  useEffect(() => {
    const ch = supabase
      .channel(`dispatch-center-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, () => {
        loadOrders(); loadDriverLoads(); loadActiveDeliveries();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, (payload) => {
        loadDrivers();
        const n: any = payload.new;
        if (n?.id) {
          setDrivers((prev) => prev.map((d) => d.id === n.id
            ? { ...d, motoqueiro_lat: n.motoqueiro_lat, motoqueiro_lng: n.motoqueiro_lng }
            : d));
        }
      })
      .subscribe((status) => { console.log("[Dispatch] realtime status:", status); });
    return () => { supabase.removeChannel(ch); };
  }, [loadOrders, loadDrivers, loadDriverLoads, loadActiveDeliveries]);

  // Auto-open bottom panel when there are active deliveries (once)
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!autoOpenedRef.current && activeDeliveries.length > 0) {
      setBottomOpen(true);
      autoOpenedRef.current = true;
    }
    if (activeDeliveries.length === 0) autoOpenedRef.current = false;
  }, [activeDeliveries.length]);

  const enrichedOrders = useMemo(() => {
    return orders.map((o) => {
      const ref = o.ready_at || o.created_at;
      const minutes = Math.max(0, Math.floor((now - new Date(ref).getTime()) / 60000));
      return { ...o, waitMinutes: minutes, wait: waitColor(minutes) };
    });
  }, [orders, now]);

  const driverNameById = useMemo(() => {
    const m: Record<string, string> = {};
    drivers.forEach((d) => { m[d.id] = d.name; });
    return m;
  }, [drivers]);

  const enrichedDeliveries = useMemo(() => {
    return activeDeliveries.map((d) => {
      const started = d.delivery_started_at ? new Date(d.delivery_started_at).getTime() : now;
      const mins = Math.max(0, Math.floor((now - started) / 60000));
      const progress = Math.min(100, Math.round((mins / DELIVERY_ETA_MIN) * 100));
      return {
        ...d,
        driver_name: d.driver_id ? driverNameById[d.driver_id] || "Motoqueiro" : "Motoqueiro",
        minutes: mins,
        progress,
      };
    });
  }, [activeDeliveries, driverNameById, now]);

  const driversEnRoute = useMemo(() => {
    const s = new Set<string>();
    activeDeliveries.forEach((d) => { if (d.driver_id) s.add(d.driver_id); });
    return s;
  }, [activeDeliveries]);

  const selectedOrder = enrichedOrders.find((o) => o.id === selectedOrderId) || null;

  const handleAssign = async (driverId: string) => {
    if (!selectedOrderId) {
      toast.error("Selecione um pedido primeiro.");
      return;
    }
    try {
      await assignMotoqueiroToOrder(selectedOrderId, driverId);
      setSelectedOrderId(null);
      loadOrders(); loadDriverLoads();
    } catch (e) { console.error(e); }
  };

  const handleSelectOrder = (o: DispatchOrder) => {
    setSelectedOrderId(o.id);
    if (o.customer_lat && o.customer_lng) {
      setFlyTarget({ lat: Number(o.customer_lat), lng: Number(o.customer_lng) });
    }
  };

  const handleFocusDelivery = (d: ActiveDelivery) => {
    if (d.customer_lat && d.customer_lng) {
      setFlyTarget({ lat: Number(d.customer_lat), lng: Number(d.customer_lng) });
    }
    setPulseDeliveryId(d.id);
    setTimeout(() => setPulseDeliveryId((cur) => (cur === d.id ? null : cur)), 2000);
  };

  const handleMarkDelivered = async (d: ActiveDelivery) => {
    try {
      const { error } = await (supabase.from as any)("delivery_orders")
        .update({ driver_status: "entregue", delivered_at: new Date().toISOString() })
        .eq("id", d.id);
      if (error) throw error;
      toast.success(`Pedido #${d.order_number || d.id.slice(0, 6)} marcado como entregue`);
      setActiveDeliveries((prev) => prev.filter((x) => x.id !== d.id));
      loadActiveDeliveries(); loadDriverLoads();
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível marcar como entregue");
    }
  };

  const markerScale = tvMode ? 1.25 : 1;

  const getOrderIcon = (hex: string, selected: boolean) => {
    if (!L) return undefined;
    const key = `o-${hex}-${selected ? 1 : 0}-${tvMode ? "tv" : "n"}`;
    if (iconCache.current[key]) return iconCache.current[key];
    const size = Math.round((selected ? 44 : 34) * markerScale);
    const icon = L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:${hex};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:${selected ? 18 : 14}px;">📦</div>`,
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: "dispatch-order-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  const getDriverIcon = () => {
    if (!L) return undefined;
    const key = `driver-${tvMode ? "tv" : "n"}`;
    if (iconCache.current[key]) return iconCache.current[key];
    const size = Math.round(38 * markerScale);
    const icon = L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:#1e40af;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:20px;">🛵</div>`,
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: "dispatch-driver-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  const getStoreIcon = () => {
    if (!L) return undefined;
    const key = `store-${tvMode ? "tv" : "n"}`;
    if (iconCache.current[key]) return iconCache.current[key];
    const size = Math.round(38 * markerScale);
    const icon = L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:#f59e0b;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:20px;">🏪</div>`,
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: "dispatch-store-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  const getDeliveryIcon = (pulsing: boolean) => {
    if (!L) return undefined;
    const key = `delivery-${pulsing ? "p" : "n"}-${tvMode ? "tv" : "n"}`;
    if (iconCache.current[key]) return iconCache.current[key];
    const size = Math.round((pulsing ? 46 : 38) * markerScale);
    const pulseStyle = pulsing
      ? `animation: dispatchPulse 1s ease-out infinite; box-shadow:0 0 0 0 rgba(16,185,129,0.7);`
      : `box-shadow:0 2px 8px rgba(0,0,0,.3);`;
    const icon = L.divIcon({
      html: `<div style="width:${size}px;height:${size}px;background:#10b981;border:3px solid white;border-radius:50%;${pulseStyle}display:flex;align-items:center;justify-content:center;font-size:20px;">🛵</div>`,
      iconSize: [size, size], iconAnchor: [size / 2, size / 2], className: "dispatch-delivery-marker",
    });
    iconCache.current[key] = icon;
    return icon;
  };

  const containerClass = tvMode
    ? "fixed inset-0 z-[9999] bg-slate-100"
    : "relative h-[calc(100vh-140px)] w-full";

  const titleTextSize = tvMode ? "text-base" : "text-sm";
  const bodyTextSize = tvMode ? "text-sm" : "text-xs";
  const smallTextSize = tvMode ? "text-xs" : "text-[11px]";
  const tinyTextSize = tvMode ? "text-[11px]" : "text-[10px]";
  const panelWidth = tvMode ? "w-[320px]" : "w-[280px]";

  // Bottom panel sizing
  const bottomBarHeight = 50;
  const bottomExpandedDesktop = tvMode ? 200 : 320;

  return (
    <div className={containerClass}>
      {/* pulse keyframes for delivery markers */}
      <style>{`
        @keyframes dispatchPulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
          70% { box-shadow: 0 0 0 18px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>

      {/* Map fills whole area */}
      <div className="absolute inset-0 bg-slate-100">
        {leafletReady ? (
          <MapContainer
            center={[storeLat, storeLng]}
            zoom={13}
            zoomControl={false}
            className="w-full h-full"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo target={flyTarget} />
            <Marker position={[storeLat, storeLng]} icon={getStoreIcon() as any} />
            {enrichedOrders
              .filter((o) => o.customer_lat && o.customer_lng)
              .map((o) => (
                <Marker
                  key={o.id}
                  position={[Number(o.customer_lat), Number(o.customer_lng)]}
                  icon={getOrderIcon(o.wait.hex, selectedOrderId === o.id) as any}
                  eventHandlers={{ click: () => handleSelectOrder(o) }}
                />
              ))}
            {drivers
              .filter((d) => d.motoqueiro_lat && d.motoqueiro_lng)
              .map((d) => (
                <Marker
                  key={d.id}
                  position={[Number(d.motoqueiro_lat), Number(d.motoqueiro_lng)]}
                  icon={getDriverIcon() as any}
                />
              ))}
            {/* Active deliveries destination markers (green scooter, pulses on hover/click) */}
            {enrichedDeliveries
              .filter((d) => d.customer_lat && d.customer_lng)
              .map((d) => (
                <Marker
                  key={`del-${d.id}`}
                  position={[Number(d.customer_lat), Number(d.customer_lng)]}
                  icon={getDeliveryIcon(pulseDeliveryId === d.id) as any}
                  eventHandlers={{ click: () => handleFocusDelivery(d) }}
                />
              ))}
            {/* Custom zoom controls, positioned below left panel */}
            <ZoomControlBelow tvMode={tvMode} leftOpen={leftOpen} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
            Carregando mapa...
          </div>
        )}
      </div>

      {/* TV mode toggle button - top right */}
      <button
        type="button"
        onClick={() => setTvMode((v) => !v)}
        className="absolute top-3 right-3 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs uppercase shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
        title={tvMode ? "Sair da tela cheia (Esc)" : "Modo TV / tela cheia"}
      >
        {tvMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        <span className="hidden sm:inline">{tvMode ? "Sair TV" : "Modo TV"}</span>
      </button>

      {/* LEFT floating panel: Para despachar */}
      <div
        className={cn(
          "absolute top-3 left-3 z-[900] max-w-[calc(100vw-1.5rem)]",
          panelWidth
        )}
      >
        <div className="bg-white/95 backdrop-blur-sm border border-orange-100 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b bg-orange-50/80 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-600" />
            <h3 className={cn("font-black text-orange-900 uppercase", titleTextSize)}>Para despachar</h3>
            <span className={cn("ml-auto font-bold text-orange-700", bodyTextSize)}>{enrichedOrders.length}</span>
            <button
              type="button"
              onClick={() => setLeftOpen((v) => !v)}
              className="ml-1 p-1 rounded hover:bg-orange-100 text-orange-700"
              title={leftOpen ? "Recolher" : "Expandir"}
            >
              {leftOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {leftOpen && (
            <div
              className="overflow-y-auto p-2 space-y-2"
              style={{ maxHeight: tvMode ? "calc(100vh - 120px)" : "calc(100vh - 260px)" }}
            >
              {enrichedOrders.length === 0 && (
                <div className={cn("text-muted-foreground text-center py-6", bodyTextSize)}>
                  Nenhum pedido pronto aguardando entregador.
                </div>
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
                      selected ? "border-orange-500 ring-2 ring-orange-300 bg-orange-50" : "border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("w-2.5 h-2.5 rounded-full", o.wait.bg)} />
                      <span className={cn("font-black text-slate-900", bodyTextSize)}>
                        {String(numLabel).startsWith("#") ? numLabel : `#${numLabel}`}
                      </span>
                      <span className={cn("ml-auto font-bold uppercase text-slate-500", tinyTextSize)}>
                        {originLabel(o.order_type)}
                      </span>
                    </div>
                    <div className={cn("text-slate-600 truncate", smallTextSize)}>
                      {o.neighborhood || o.customer_address || o.customer_name || "Sem endereço"}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={cn("font-bold text-white px-1.5 py-0.5 rounded", o.wait.bg, tinyTextSize)}>
                        {o.waitMinutes}min
                      </span>
                      {!o.customer_lat && (
                        <span className={cn("text-slate-400 italic", tinyTextSize)}>sem GPS</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT floating panel: Motoqueiros */}
      <div
        className={cn(
          "absolute top-3 right-3 z-[900] max-w-[calc(100vw-1.5rem)]",
          panelWidth
        )}
        style={{ marginTop: tvMode ? 0 : 44 }}
      >
        <div className="bg-white/95 backdrop-blur-sm border border-orange-100 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b bg-orange-50/80 flex items-center gap-2">
            <Bike className="w-4 h-4 text-orange-600" />
            <h3 className={cn("font-black text-orange-900 uppercase", titleTextSize)}>Motoqueiros</h3>
            <span className={cn("ml-auto font-bold text-orange-700", bodyTextSize)}>{drivers.length}</span>
            <button
              type="button"
              onClick={() => setRightOpen((v) => !v)}
              className="ml-1 p-1 rounded hover:bg-orange-100 text-orange-700"
              title={rightOpen ? "Recolher" : "Expandir"}
            >
              {rightOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {rightOpen && (
            <>
              {selectedOrder && (
                <div className={cn("px-3 py-2 bg-orange-100/80 border-b text-orange-900 font-bold", smallTextSize)}>
                  Despachar{" "}
                  <span className="font-black">
                    #{(selectedOrder.order_number || selectedOrder.id.slice(0, 6)).toString().toUpperCase()}
                  </span>{" "}
                  — clique num motoqueiro
                </div>
              )}
              <div
                className="overflow-y-auto p-2 space-y-2"
                style={{ maxHeight: tvMode ? "calc(100vh - 160px)" : "calc(100vh - 300px)" }}
              >
                {drivers.length === 0 && (
                  <div className={cn("text-muted-foreground text-center py-6", bodyTextSize)}>
                    Nenhum motoqueiro ativo.
                  </div>
                )}
                {drivers.map((d) => {
                  const load = driverLoads[d.id] || 0;
                  const color = loadCountColor(load);
                  const canClick = !!selectedOrderId;
                  const enRoute = driversEnRoute.has(d.id);
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
                      <span className={cn("font-bold text-slate-800 truncate flex-1", bodyTextSize)}>{d.name}</span>
                      {enRoute && (
                        <span
                          className={cn(
                            "flex items-center gap-0.5 bg-orange-500 text-white font-black rounded-full px-1.5 py-0.5 shrink-0",
                            tinyTextSize
                          )}
                          title="Em rota agora"
                        >
                          <Zap className="w-2.5 h-2.5" />
                          ROTA
                        </span>
                      )}
                      <span
                        className={cn(
                          "font-black text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                          color,
                          tinyTextSize
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
            </>
          )}
        </div>
      </div>

      {/* BOTTOM-LEFT floating panel: Entregas em Andamento (expands upward) */}
      <div
        className={cn(
          "absolute bottom-3 left-3 z-[950] max-w-[calc(100vw-1.5rem)] flex flex-col-reverse",
          panelWidth
        )}
      >
        <div className="bg-white/95 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Compact tab (always visible) */}
          <button
            type="button"
            onClick={() => setBottomOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-emerald-50/80 border-b border-emerald-100 hover:bg-emerald-100/70 transition-colors"
          >
            <Bike className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className={cn("font-black text-emerald-900 uppercase", titleTextSize)}>
              Entregas
            </span>
            <span className={cn(
              "ml-auto bg-emerald-600 text-white font-bold rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center",
              tinyTextSize
            )}>
              {enrichedDeliveries.length}
            </span>
            {bottomOpen
              ? <ChevronDown className="w-4 h-4 text-emerald-700" />
              : <ChevronUp className="w-4 h-4 text-emerald-700" />}
          </button>

          {/* Expanded content — grows upward via flex-col-reverse on the outer */}
          {bottomOpen && (
            <div
              className="overflow-y-auto p-2 space-y-2"
              style={{
                maxHeight:
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? "50vh"
                    : `${tvMode ? 340 : 380}px`,
              }}
            >
              {enrichedDeliveries.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-6">
                  <Package className="h-8 w-8 mb-2 opacity-40" />
                  <p className={cn("font-semibold text-slate-700", bodyTextSize)}>
                    Nenhuma entrega em andamento
                  </p>
                </div>
              ) : (
                enrichedDeliveries.map((d) => {
                  const numLabel = d.order_number || `#${d.id.slice(0, 6).toUpperCase()}`;
                  return (
                    <div
                      key={d.id}
                      onMouseEnter={() => setPulseDeliveryId(d.id)}
                      onMouseLeave={() =>
                        setPulseDeliveryId((cur) => (cur === d.id ? null : cur))
                      }
                      onClick={() => handleFocusDelivery(d)}
                      className="cursor-pointer border border-emerald-100 rounded-lg bg-white p-2 transition-all hover:shadow-md hover:border-emerald-400"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("font-black text-slate-900", bodyTextSize)}>
                          {String(numLabel).startsWith("#") ? numLabel : `#${numLabel}`}
                        </span>
                        <span className={cn(
                          "ml-auto flex items-center gap-1 bg-emerald-600 text-white font-bold rounded-full px-1.5 py-0.5",
                          tinyTextSize
                        )}>
                          <Clock className="w-2.5 h-2.5" />
                          {d.minutes}min
                        </span>
                      </div>
                      <div className={cn("flex items-center gap-1 text-slate-700 font-semibold truncate", smallTextSize)}>
                        <Bike className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{d.driver_name}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleFocusDelivery(d); }}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold py-1 hover:bg-emerald-100 transition-colors",
                            tinyTextSize
                          )}
                        >
                          <Navigation className="w-3 h-3" />
                          Rota
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMarkDelivered(d); }}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 rounded-md border border-emerald-500 bg-emerald-600 text-white font-bold py-1 hover:bg-emerald-700 transition-colors",
                            tinyTextSize
                          )}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Entregue
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Positions leaflet zoom control below the left floating panel
function ZoomControlBelow({ tvMode, leftOpen }: { tvMode: boolean; leftOpen: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!L) return;
    const ctrl = L.control.zoom({ position: "topleft" });
    ctrl.addTo(map);
    // Push it down below the floating panel
    const container = (ctrl as any)._container as HTMLElement | undefined;
    if (container) {
      container.style.marginTop = leftOpen ? (tvMode ? "440px" : "360px") : "60px";
      container.style.marginLeft = tvMode ? "340px" : "300px";
    }
    return () => {
      ctrl.remove();
    };
  }, [map, tvMode, leftOpen]);
  return null;
}
