import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Loader2, MapPin, Bike, Home, Store, Navigation as NavIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type LeafletModule = typeof import("leaflet");

interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  polygon_coords?: [number, number][];
  radius_km?: number;
}

interface StoreSettings {
  latitude?: number;
  longitude?: number;
  name?: string;
}

interface DeliveryMapComponentProps {
  deliveryAreas: DeliveryArea[];
  storeSettings: StoreSettings | null;
  onClose: () => void;
  motoqueiroCoords?: { lat: number; lng: number } | null;
  customerCoords?: { lat: number; lng: number } | null;
  isTracking?: boolean;
  orderId?: string;
}

const colors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2",
];

export function DeliveryMapComponent({
  deliveryAreas,
  storeSettings,
  onClose,
  motoqueiroCoords: initialMotoqueiroCoords,
  customerCoords,
  isTracking = false,
  orderId,
}: DeliveryMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMotoCoords, setCurrentMotoCoords] = useState<{lat: number, lng: number} | null>(initialMotoqueiroCoords || null);
  
  const markersRef = useRef<{
    store?: import("leaflet").Marker;
    customer?: import("leaflet").Marker;
    courier?: import("leaflet").Marker;
  }>({});
  const routeLineRef = useRef<import("leaflet").Polyline | null>(null);

  // Realtime subscription for courier position
  useEffect(() => {
    if (!isTracking || !orderId) return;

    console.log("📍 [Map] Iniciando Realtime para pedido:", orderId);
    const channel = supabase
      .channel(`tracking_map_${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'delivery_orders',
        filter: `id=eq.${orderId}`
      }, (payload) => {
        const { motoqueiro_lat, motoqueiro_lng } = payload.new;
        if (motoqueiro_lat !== null && motoqueiro_lng !== null) {
          const newCoords = { lat: Number(motoqueiro_lat), lng: Number(motoqueiro_lng) };
          console.log("📍 [Map] Coordenadas recebidas via Realtime:", newCoords);
          setCurrentMotoCoords(newCoords);
        }
      })
      .subscribe((status) => {
        console.log("📍 [Map] Status da subscrição Realtime:", status);
      });

    return () => {
      console.log("📍 [Map] Removendo canal Realtime");
      supabase.removeChannel(channel);
    };
  }, [isTracking, orderId]);

  // Sync initial coords if they change from props
  useEffect(() => {
    if (initialMotoqueiroCoords) {
      setCurrentMotoCoords(initialMotoqueiroCoords);
    }
  }, [initialMotoqueiroCoords]);

  // Initial Map Load
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current) return;
      
      try {
        const L = leafletRef.current ?? await import("leaflet");
        leafletRef.current = L;
        // Corrigir ícones padrão do Leaflet somente no navegador.
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (cancelled || !mapRef.current) return;
        console.log("📍 [Map] Inicializando Leaflet...");
        const storeLat = storeSettings?.latitude || 2.8235;
        const storeLng = storeSettings?.longitude || -60.6758;
        const storeCenter: [number, number] = [storeLat, storeLng];

        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }

        const map = L.map(mapRef.current, {
          zoomControl: true, // Habilitado para facilitar navegação
          attributionControl: false,
          scrollWheelZoom: true,
          dragging: true
        }).setView(storeCenter, 14);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        mapInstance.current = map;

        // Marcador da Loja
        const storeIcon = L.divIcon({
          html: `<div class="w-10 h-10 bg-yellow-400 border-4 border-white rounded-full flex items-center justify-center shadow-lg text-lg transform hover:scale-110 transition-transform">🍕</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: 'store-marker'
        });
        markersRef.current.store = L.marker(storeCenter, { icon: storeIcon })
          .bindPopup(`<strong>${storeSettings?.name || "Nossa Loja"}</strong>`)
          .addTo(map);

        // Áreas de Entrega (se não estiver rastreando)
        if (!isTracking && deliveryAreas.length > 0) {
          deliveryAreas.forEach((area, index) => {
            if (area.polygon_coords && area.polygon_coords.length > 0) {
              L.polygon(area.polygon_coords, {
                color: colors[index % colors.length],
                weight: 2,
                opacity: 0.6,
                fillColor: colors[index % colors.length],
                fillOpacity: 0.15,
              }).addTo(map);
            }
          });
        }

        setMapReady(true);
        setLoading(false);
        // Garantir que o Leaflet calcule o tamanho corretamente após o render inicial
        setTimeout(() => {
          if (mapInstance.current) {
            mapInstance.current.invalidateSize();
            console.log("📍 [Map] invalidateSize() executado");
          }
        }, 300);

      } catch (err) {
        console.error("📍 [Map] Erro ao inicializar mapa:", err);
        setError("Erro ao carregar mapa.");
        setLoading(false);
      }
    };

    // Usar ResizeObserver para garantir que o mapa se ajuste ao container
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    // Pequeno delay para garantir que o container do Dialog esteja renderizado e com tamanho
    const timer = setTimeout(initMap, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      resizeObserver.disconnect();
      if (mapInstance.current) {
        console.log("📍 [Map] Removendo instância do mapa no cleanup");
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [deliveryAreas, storeSettings, isTracking]);

  // Atualizar marcadores dinamicamente
  useEffect(() => {
    const map = mapInstance.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const pointsToFit: import("leaflet").LatLngExpression[] = [];

    // Marcador Cliente
    if (customerCoords && customerCoords.lat && customerCoords.lng) {
      const pos: [number, number] = [Number(customerCoords.lat), Number(customerCoords.lng)];
      pointsToFit.push(pos);
      
      if (markersRef.current.customer) {
        markersRef.current.customer.setLatLng(pos);
      } else {
        const customerIcon = L.divIcon({
          html: `<div class="w-9 h-9 bg-blue-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg text-sm">🏠</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        markersRef.current.customer = L.marker(pos, { icon: customerIcon }).addTo(map);
      }
    }

    // Marcador Motoqueiro + Rota
    if (currentMotoCoords && currentMotoCoords.lat && currentMotoCoords.lng) {
      const pos: [number, number] = [Number(currentMotoCoords.lat), Number(currentMotoCoords.lng)];
      pointsToFit.push(pos);

      if (markersRef.current.courier) {
        markersRef.current.courier.setLatLng(pos);
      } else {
        const bikeIcon = L.divIcon({
          html: `<div class="relative flex items-center justify-center">
                  <div class="absolute w-12 h-12 bg-red-500/30 rounded-full animate-ping"></div>
                  <div class="w-12 h-12 bg-red-500 border-4 border-white rounded-full flex items-center justify-center shadow-xl text-2xl z-10">🛵</div>
                 </div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        markersRef.current.courier = L.marker(pos, { icon: bikeIcon }).addTo(map);
      }

      // Rota (Linha entre Motoqueiro e Cliente)
      if (customerCoords && customerCoords.lat && customerCoords.lng) {
        const custPos: [number, number] = [Number(customerCoords.lat), Number(customerCoords.lng)];
        const routePoints: [number, number][] = [pos, custPos];
        
        if (routeLineRef.current) {
          routeLineRef.current.setLatLngs(routePoints);
        } else {
          routeLineRef.current = L.polyline(routePoints, {
            color: '#EA4335',
            weight: 5,
            dashArray: '10, 10',
            opacity: 0.6
          }).addTo(map);
        }
      }
    }

    // Ajustar visualização
    if (pointsToFit.length >= 2) {
      const bounds = L.latLngBounds(pointsToFit);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else if (pointsToFit.length === 1) {
      map.setView(pointsToFit[0], 16);
    }
  }, [customerCoords, currentMotoCoords, mapReady]);

  // Se o carregamento demorar demais (5s), forçar a saída do estado de loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn("📍 [Map] Timeout de carregamento atingido, forçando exibição...");
          setLoading(false);
          if (mapInstance.current) mapInstance.current.invalidateSize();
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col overflow-hidden">
      <div 
        ref={mapRef} 
        className={`w-full h-full transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'} z-0`}
      />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-[1000]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
            Carregando Mapa...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-[1001] p-4 text-center">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
        </div>
      )}

      {!loading && !isTracking && (
        <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 relative z-[500]">
          <Button className="w-full h-12 font-black rounded-xl shadow-lg" onClick={onClose}>
            FECHAR MAPA
          </Button>
        </div>
      )}
    </div>
  );
}
