import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Bike, MapPin, Package, Maximize2, Minimize2, ChevronUp, ChevronDown } from "lucide-react";

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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [tvMode, setTvMode] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
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

  useEffect(() => {
    loadOrders(); loadDrivers(); loadDriverLoads();
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  useEffect(() => {
    const t = setInterval(() => {
      loadOrders(); loadDrivers(); loadDriverLoads();
    }, 5000);
    return () => clearInterval(t);
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        loadOrders(); loadDrivers(); loadDriverLoads();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [loadOrders, loadDrivers, loadDriverLoads]);

  useEffect(() => {
    const ch = supabase
      .channel(`dispatch-center-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "delivery_orders" }, () => {
        loadOrders(); loadDriverLoads();
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

  const containerClass = tvMode
    ? "fixed inset-0 z-[9999] bg-slate-100"
    : "relative h-[calc(100vh-140px)] w-full";

  const titleTextSize = tvMode ? "text-base" : "text-sm";
  const bodyTextSize = tvMode ? "text-sm" : "text-xs";
  const smallTextSize = tvMode ? "text-xs" : "text-[11px]";
  const tinyTextSize = tvMode ? "text-[11px]" : "text-[10px]";
  const panelWidth = tvMode ? "w-[320px]" : "w-[280px]";

  return (
    <div className={containerClass}>
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
