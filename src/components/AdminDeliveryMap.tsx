import { useEffect, useState, memo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polygon, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Dynamic imports only in client - will be loaded in useEffect
let L: typeof import("leaflet") | null = null;
let DefaultIcon: ReturnType<typeof import("leaflet").icon> | null = null;

interface AdminDeliveryMapProps {
  center: { lat: number; lng: number };
  radius: number;
  polygonCoords: [number, number][] | null;
  onLocationChange: (lat: number, lng: number) => void;
  onPolygonChange: (coords: [number, number][]) => void;
}

function MapController({ 
  center, 
  onLocationChange, 
  onPolygonChange,
  initialPolygon
}: { 
  center: { lat: number; lng: number }; 
  onLocationChange: (lat: number, lng: number) => void;
  onPolygonChange: (coords: [number, number][]) => void;
  initialPolygon: [number, number][] | null;
}) {
  const map = useMap();
  const geomanInitialized = useRef(false);

  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center.lat, center.lng, map]);

  useEffect(() => {
    if (geomanInitialized.current) return;
    
    // Configurar Geoman
    (map as any).pm.addControls({
      position: 'topleft',
      drawMarker: true,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: true,
      drawCircleMarker: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    (map as any).pm.setLang('pt_br');

    // Escutar criação de formas
    map.on('pm:create', (e: any) => {
      const layer = e.layer;
      
      if (e.shape === 'Polygon' || e.shape === 'Rectangle') {
        const coords = layer.getLatLngs()[0].map((latLng: any) => [latLng.lat, latLng.lng]);
        onPolygonChange(coords);
      } else if (e.shape === 'Marker') {
        const { lat, lng } = layer.getLatLng();
        onLocationChange(lat, lng);
      } else if (e.shape === 'Circle') {
        const { lat, lng } = layer.getLatLng();
        const radius = layer.getRadius() / 1000; // km
        onLocationChange(lat, lng);
        // Nota: O raio é controlado pelo slider no formulário principal para manter compatibilidade
      }

      // Remover a camada desenhada pelo Geoman para que o React assuma o controle
      layer.remove();
    });

    geomanInitialized.current = true;
  }, [map, onLocationChange, onPolygonChange]);

  return null;
}

export const AdminDeliveryMap = memo(function AdminDeliveryMap({ 
  center, 
  radius, 
  polygonCoords, 
  onLocationChange, 
  onPolygonChange 
}: AdminDeliveryMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([center.lat, center.lng]);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    if (center.lat && center.lng) {
      setMapCenter([center.lat, center.lng]);
    }
  }, [center.lat, center.lng]);

  // Carregar Leaflet e Geoman dinamicamente apenas no cliente
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadLeaflet = async () => {
      if (L) return;
      
      L = await import("leaflet");
      
      // Carregar Geoman
      try {
        await import("@geoman-io/leaflet-geoman-free");
        await import("@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css");
      } catch (e) {
        console.warn("Geoman não disponível:", e);
      }
      
      // Fix for default marker icons
      const icon = (await import('leaflet/dist/images/marker-icon.png')).default;
      const iconShadow = (await import('leaflet/dist/images/marker-shadow.png')).default;
      
      DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      
      L.Marker.prototype.options.icon = DefaultIcon;
      setLeafletReady(true);
    };
    
    loadLeaflet();
  }, []);

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController 
          center={{ lat: mapCenter[0], lng: mapCenter[1] }} 
          onLocationChange={onLocationChange}
          onPolygonChange={onPolygonChange}
          initialPolygon={polygonCoords}
        />
        
        {/* Renderizar Polígono se existir */}
        {polygonCoords && polygonCoords.length > 0 ? (
          <Polygon 
            positions={polygonCoords}
            pathOptions={{
              color: "#ea580c",
              fillColor: "#ea580c",
              fillOpacity: 0.35
            }}
          />
        ) : (
          /* Mostrar marcador apenas se não houver polígono */
          <Marker position={mapCenter} />
        )}
      </MapContainer>
    </div>
  );
});
