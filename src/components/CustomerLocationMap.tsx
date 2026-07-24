import { useEffect, useState, memo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

let L: typeof import("leaflet") | null = null;

interface CustomerLocationMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export const CustomerLocationMap = memo(function CustomerLocationMap({
  lat,
  lng,
  onChange,
}: CustomerLocationMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (async () => {
      if (!L) {
        L = await import("leaflet");
        const icon = (await import("leaflet/dist/images/marker-icon.png")).default;
        const iconShadow = (await import("leaflet/dist/images/marker-shadow.png")).default;
        const DefaultIcon = L.icon({
          iconUrl: icon,
          shadowUrl: iconShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;
      }
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <div className="w-full h-40 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className="w-full h-40 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        className="w-full h-full"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={lat} lng={lng} />
        <Marker
          position={[lat, lng]}
          draggable
          eventHandlers={{
            dragend: (e: any) => {
              const { lat: nLat, lng: nLng } = e.target.getLatLng();
              onChange(nLat, nLng);
            },
          }}
        />
      </MapContainer>
    </div>
  );
});
