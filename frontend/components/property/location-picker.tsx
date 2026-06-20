// components/property/location-picker.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Locate } from "lucide-react";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMapEvents } = require("react-leaflet") as typeof import("react-leaflet");
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function usePinIcon() {
  const [icon, setIcon] = React.useState<any>(null);
  React.useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      const html = `
        <div style="
          width:26px;height:26px;border-radius:9999px 9999px 9999px 0;
          transform:rotate(-45deg);background:#2463eb;border:2px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,.35);
        "></div>`;
      setIcon(L.divIcon({ html, className: "", iconSize: [26, 26], iconAnchor: [13, 26] }));
    });
    return () => { cancelled = true; };
  }, []);
  return icon;
}

const DEFAULT_CENTER: [number, number] = [9.0227, 38.7689]; // Addis Ababa fallback

interface LocationPickerProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export function LocationPicker({ lat, lng, onChange, className }: LocationPickerProps) {
  const icon = usePinIcon();
  const hasPin = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);
  const [recenterKey, setRecenterKey] = React.useState(0);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setRecenterKey((k) => k + 1);
      },
      () => {
        // user denied or unavailable — silently ignore, they can still click the map
      }
    );
  };

  return (
    <div className={className}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div className="relative h-64 overflow-hidden rounded-xl border border-border">
        <MapContainer
          key={recenterKey}
          center={hasPin ? [lat as number, lng as number] : DEFAULT_CENTER}
          zoom={hasPin ? 14 : 6}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={onChange} />
          {hasPin && icon && <Marker position={[lat as number, lng as number]} icon={icon} />}
        </MapContainer>

        <button
          type="button"
          onClick={handleLocate}
          className="absolute right-3 top-3 z-[1000] flex items-center gap-1.5 rounded-lg border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium shadow backdrop-blur-sm transition hover:bg-background"
        >
          <Locate className="h-3.5 w-3.5" />
          Use my location
        </button>

        {!hasPin && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[1000] flex justify-center">
            <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow backdrop-blur-sm">
              Click the map to drop a pin
            </span>
          </div>
        )}
      </div>
    </div>
  );
}