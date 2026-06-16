"use client";


import * as React from "react";
import dynamic from "next/dynamic";
import {
  MapPin, X, Bed, Bath, Maximize2, ExternalLink,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SSR-safe Leaflet imports ─────────────────────────────────────────────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer), { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer), { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker), { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapProperty {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  priceLabel: string;
  ethPrice?: string;
  images: string[];
  beds?: number;
  baths?: number;
  areaSqm?: number;
  isVerified?: boolean;
  status: "for_sale" | "for_rent" | "pending";
}

export interface MapBasedListingProps {
  properties: MapProperty[];
  className?: string;
  onViewProperty?: (id: string) => void;
}

// ─── Dark mode detection ──────────────────────────────────────────────────────

function useDarkMode() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const check = () =>
      setDark(mq.matches || document.documentElement.classList.contains("dark"));
    check();
    mq.addEventListener("change", check);
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      mq.removeEventListener("change", check);
      observer.disconnect();
    };
  }, []);
  return dark;
}

// ─── Zoom watcher — must live inside <MapContainer> ──────────────────────────
// We can't use hooks from react-leaflet at module level because of dynamic
// imports, so we lazy-require inside the component body instead.

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMapEvents } = require("react-leaflet") as typeof import("react-leaflet");
  useMapEvents({
    zoom: (e) => onZoom((e.target as L.Map).getZoom()),
    zoomend: (e) => onZoom((e.target as L.Map).getZoom()),
  });
  return null;
}

// ─── Glowing dot icon (low zoom) ─────────────────────────────────────────────

function useGlowIcon(active: boolean) {
  const [icon, setIcon] = React.useState<any>(null);
  React.useEffect(() => {
    import("leaflet").then((L) => {
      const color = active ? "#5DCAA5" : "#1D9E75";
      const html = `
        <style>
          @keyframes propPulse {
            0%,100% { transform: scale(1);   opacity: 0.3; }
            50%      { transform: scale(1.8); opacity: 0.1; }
          }
        </style>
        <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:30px;height:30px;border-radius:50%;
            background:${color};opacity:0.15;
            animation:propPulse 2.2s ease-in-out infinite 0.4s;"></div>
          <div style="position:absolute;width:20px;height:20px;border-radius:50%;
            background:${color};opacity:0.25;
            animation:propPulse 2.2s ease-in-out infinite;"></div>
          <div style="width:10px;height:10px;border-radius:50%;
            background:${color};position:relative;z-index:1;
            box-shadow:0 0 6px ${color},0 0 14px ${color}80;"></div>
        </div>`;
      setIcon(
        L.divIcon({ html, className: "", iconSize: [20, 20], iconAnchor: [10, 10] })
      );
    });
  }, [active]);
  return icon;
}

// ─── Price bubble icon (high zoom) ───────────────────────────────────────────

function usePriceIcon(label: string, active: boolean, dark: boolean) {
  const [icon, setIcon] = React.useState<any>(null);
  React.useEffect(() => {
    import("leaflet").then((L) => {
      const bg     = active ? "#1D9E75"  : dark ? "#1a2332"  : "#ffffff";
      const fg     = active ? "#ffffff"  : dark ? "#e2e8f0"  : "#0f172a";
      const border = active ? "#0F6E56"  : dark ? "#2d4a3e"  : "#cbd5e1";
      const shadow = active
        ? "0 2px 12px rgba(29,158,117,0.5)"
        : "0 2px 8px rgba(0,0,0,0.2)";
      const html = `
        <div style="
          background:${bg};color:${fg};border:1.5px solid ${border};
          border-radius:20px;padding:4px 10px;font-size:12px;font-weight:700;
          font-family:system-ui,sans-serif;white-space:nowrap;
          box-shadow:${shadow};position:relative;cursor:pointer;
        ">
          ${label}
          <span style="
            position:absolute;bottom:-6px;left:50%;
            width:8px;height:8px;background:${bg};
            border-right:1.5px solid ${border};border-bottom:1.5px solid ${border};
            transform:translateX(-50%) rotate(45deg);
          "></span>
        </div>`;
      setIcon(L.divIcon({ html, className: "", iconAnchor: [32, 38] }));
    });
  }, [label, active, dark]);
  return icon;
}

// ─── Individual marker components ─────────────────────────────────────────────

function GlowMarker({
  property, isActive, onClick,
}: {
  property: MapProperty; isActive: boolean; onClick: () => void;
}) {
  const icon = useGlowIcon(isActive);
  if (!icon) return null;
  return (
    <Marker
      position={[property.lat, property.lng]}
      icon={icon}
      zIndexOffset={isActive ? 1000 : 0}
      eventHandlers={{ click: onClick }}
    />
  );
}

function PriceMarker({
  property, isActive, onClick, dark,
}: {
  property: MapProperty; isActive: boolean; onClick: () => void; dark: boolean;
}) {
  const icon = usePriceIcon(property.priceLabel, isActive, dark);
  if (!icon) return null;
  return (
    <Marker
      position={[property.lat, property.lng]}
      icon={icon}
      zIndexOffset={isActive ? 1000 : 0}
      eventHandlers={{ click: onClick }}
    />
  );
}

// ─── All markers + zoom watcher (lives inside MapContainer) ──────────────────

function MapMarkers({
  properties, activeId, onSelect, dark,
}: {
  properties: MapProperty[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  dark: boolean;
}) {
  const [zoom, setZoom] = React.useState(2);
  const showGlow = zoom < 8;

  return (
    <>
      <ZoomWatcher onZoom={setZoom} />
      {properties.map((p) => {
        const isActive = p.id === activeId;
        const toggle   = () => onSelect(isActive ? null : p.id);
        return showGlow ? (
          <GlowMarker  key={p.id} property={p} isActive={isActive} onClick={toggle} />
        ) : (
          <PriceMarker key={p.id} property={p} isActive={isActive} onClick={toggle} dark={dark} />
        );
      })}
    </>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MapProperty["status"] }) {
  const map = {
    for_sale: { cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300", label: "For sale" },
    for_rent: { cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",           label: "For rent" },
    pending:  { cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",       label: "Pending"  },
  } as const;
  const { cls, label } = map[status];
  return (
    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", cls)}>
      {label}
    </span>
  );
}

// ─── Floating popup card ──────────────────────────────────────────────────────

function PopupCard({
  property, onClose, onView,
}: {
  property: MapProperty; onClose: () => void; onView: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-auto absolute bottom-5 left-1/2 z-[999] w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative h-40 bg-muted">
        {property.images[0] ? (
          <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-20">🏢</div>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 shadow backdrop-blur-sm transition hover:bg-background"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {property.isVerified && (
          <span className="absolute bottom-2 left-2 rounded-md bg-emerald-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            ✓ Blockchain verified
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{property.title}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />{property.location}
            </p>
          </div>
          <StatusBadge status={property.status} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{property.priceLabel}</span>
          {property.ethPrice && (
            <span className="text-xs font-medium text-emerald-500">{property.ethPrice}</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          {property.beds    != null && <span className="flex items-center gap-1"><Bed       className="h-3 w-3" />{property.beds} bed</span>}
          {property.baths   != null && <span className="flex items-center gap-1"><Bath      className="h-3 w-3" />{property.baths} bath</span>}
          {property.areaSqm != null && <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{property.areaSqm} m²</span>}
        </div>
        <button
          onClick={() => onView(property.id)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          View property <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Listings sidebar ─────────────────────────────────────────────────────────

function Sidebar({
  properties, activeId, onSelect,
}: {
  properties: MapProperty[]; activeId: string | null; onSelect: (id: string) => void;
}) {
  const activeRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);

  return (
    <div className="flex h-full flex-col overflow-hidden border-l border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{properties.length} listings</p>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />Tap a pin
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {properties.map((p) => {
          const isActive = p.id === activeId;
          return (
            <div
              key={p.id}
              ref={isActive ? (activeRef as React.RefObject<HTMLDivElement>) : undefined}
              className={cn(
                "group relative cursor-pointer border-b border-border/40 transition-colors",
                isActive ? "bg-emerald-50/70 dark:bg-emerald-950/20" : "hover:bg-muted/40"
              )}
              onClick={() => onSelect(p.id)}
            >
              {isActive && (
                <div className="absolute inset-y-0 left-0 w-0.5 rounded-r bg-emerald-500" />
              )}
              <div className="flex gap-3 p-3">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.images[0] ? (
                    <img
                      src={p.images[0]} alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl opacity-30">🏢</div>
                  )}
                  {p.isVerified && (
                    <span className="absolute bottom-1 left-1 rounded bg-emerald-500/90 px-1 py-0.5 text-[9px] font-semibold text-white">✓</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="truncate text-sm font-semibold text-foreground leading-snug">{p.title}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-0.5 flex items-center gap-0.5 truncate text-xs text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />{p.location}
                  </p>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-foreground">{p.priceLabel}</span>
                    {p.ethPrice && (
                      <span className="text-xs font-medium text-emerald-500">{p.ethPrice}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {p.beds    != null && <span className="flex items-center gap-0.5"><Bed       className="h-3 w-3" />{p.beds}</span>}
                    {p.baths   != null && <span className="flex items-center gap-0.5"><Bath      className="h-3 w-3" />{p.baths}</span>}
                    {p.areaSqm != null && <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" />{p.areaSqm}m²</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Collapse toggle ──────────────────────────────────────────────────────────

function CollapseToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? "Show listings" : "Hide listings"}
      className="absolute -left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:bg-muted"
    >
      {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function MapBasedListing({ properties, className, onViewProperty }: MapBasedListingProps) {
  const dark = useDarkMode();
  const [activeId, setActiveId]                 = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const activeProperty = properties.find((p) => p.id === activeId) ?? null;

  const tileUrl = dark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const handleView = (id: string) => {
    if (onViewProperty) onViewProperty(id);
    else window.location.href = `/properties/${id}`;
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      <div
        className={cn(
          "relative flex overflow-hidden rounded-2xl border border-border h-[580px]",
          className
        )}
      >
        {/* ── Map pane ──────────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden">
          <MapContainer
            center={[20, 15]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
            worldCopyJump={false}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer key={tileUrl} url={tileUrl} />
            <MapMarkers
              properties={properties}
              activeId={activeId}
              onSelect={setActiveId}
              dark={dark}
            />
          </MapContainer>

          {/* Floating detail card */}
          {activeProperty && (
            <PopupCard
              property={activeProperty}
              onClose={() => setActiveId(null)}
              onView={handleView}
            />
          )}

          {/* Hint */}
          <div className="absolute left-3 top-3 z-[1000] rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm select-none">
            Scroll to zoom · Click a pin for details
          </div>

          <p className="absolute bottom-1 right-2 z-[1000] select-none text-[10px] text-muted-foreground/40">
            © CARTO © OpenStreetMap
          </p>
        </div>

        {/* ── Listings sidebar ───────────────────────────────────────────── */}
        <div
          className={cn(
            "relative shrink-0 transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
          )}
        >
          <CollapseToggle
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
          <div className="h-full w-80">
            <Sidebar
              properties={properties}
              activeId={activeId}
              onSelect={(id) => setActiveId((prev) => (prev === id ? null : id))}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MapBasedListing;
