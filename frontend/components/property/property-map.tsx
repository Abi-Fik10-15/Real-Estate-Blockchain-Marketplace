"use client";

import * as React from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { GeoLocation } from "@/types";

// Fix default marker icons (Leaflet + bundlers).
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function PropertyMap({
  location,
  title,
}: {
  location: GeoLocation;
  title: string;
}) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const hasValidCoordinates =
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng) &&
    !(location.lat === 0 && location.lng === 0);

  if (!isMounted) {
    return <div className="h-full w-full bg-muted/30" />;
  }

  if (!hasValidCoordinates) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Map preview unavailable for this listing.
      </div>
    );
  }

  const center: [number, number] = [location.lat, location.lng];

  return (
    <MapContainer
      key={`${location.lat}-${location.lng}-${title}`}
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={icon}>
        <Popup>
          <strong>{title}</strong>
          <br />
          {location.address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
