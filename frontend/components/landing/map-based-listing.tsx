"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  X,
  Bed,
  Bath,
  Maximize2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SSR-safe Leaflet imports ─────────────────────────────────────────────────
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);
const ZoomControl = dynamic(
  () => import("react-leaflet").then((m) => m.ZoomControl),
  { ssr: false },
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
  /** Lighter voyager tiles + auto-fit — better for dashboard embeds */
  variant?: "default" | "embedded";
}

// ─── Coordinate helpers ───────────────────────────────────────────────────────

function isValidCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
  );
}

/** Spread pins that share the same coordinates so both remain clickable. */
function spreadOverlappingCoordinates(properties: MapProperty[]): MapProperty[] {
  const THRESHOLD = 0.0008;
  const groups: MapProperty[][] = [];

  for (const property of properties) {
    let placed = false;
    for (const group of groups) {
      const ref = group[0];
      if (
        Math.abs(property.lat - ref.lat) < THRESHOLD &&
        Math.abs(property.lng - ref.lng) < THRESHOLD
      ) {
        group.push(property);
        placed = true;
        break;
      }
    }
    if (!placed) groups.push([property]);
  }

  const spread: MapProperty[] = [];
  for (const group of groups) {
    if (group.length === 1) {
      spread.push(group[0]);
      continue;
    }
    const { lat: baseLat, lng: baseLng } = group[0];
    const radius = 0.004;
    group.forEach((property, index) => {
      const angle = (2 * Math.PI * index) / group.length;
      spread.push({
        ...property,
        lat: baseLat + radius * Math.cos(angle),
        lng: baseLng + radius * Math.sin(angle),
      });
    });
  }
  return spread;
}

function getInitialCenter(properties: MapProperty[]): [number, number] {
  if (properties.length === 0) return [39.8283, -98.5795]; // US centroid fallback
  const lat =
    properties.reduce((sum, p) => sum + p.lat, 0) / properties.length;
  const lng =
    properties.reduce((sum, p) => sum + p.lng, 0) / properties.length;
  return [lat, lng];
}

function getInitialZoom(count: number) {
  if (count <= 1) return 13;
  if (count <= 4) return 11;
  return 5;
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

/** Fit map to all property pins on load and when the list changes. */
function MapBoundsController({
  properties,
  fitTrigger,
  layoutTrigger,
}: {
  properties: MapProperty[];
  fitTrigger: number;
  layoutTrigger: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMap } = require("react-leaflet") as typeof import("react-leaflet");
  const map = useMap();

  React.useEffect(() => {
    if (properties.length === 0) return;

    void import("leaflet").then((L) => {
      if (properties.length === 1) {
        map.setView([properties[0].lat, properties[0].lng], 14, { animate: true });
        return;
      }

      const bounds = L.latLngBounds(
        properties.map((p) => [p.lat, p.lng] as [number, number]),
      );
      map.fitBounds(bounds, {
        padding: [48, 48],
        maxZoom: 14,
        animate: true,
      });
    });
  }, [properties, map, fitTrigger]);

  // Leaflet sometimes mis-sizes when the sidebar animates
  React.useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 320);
    return () => clearTimeout(timer);
  }, [map, layoutTrigger]);

  return null;
}

/** Pan/zoom to the selected listing when chosen from the sidebar. */
function MapFlyToActive({
  properties,
  activeId,
}: {
  properties: MapProperty[];
  activeId: string | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useMap } = require("react-leaflet") as typeof import("react-leaflet");
  const map = useMap();
  const prevActiveRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!activeId || activeId === prevActiveRef.current) return;
    prevActiveRef.current = activeId;

    const property = properties.find((p) => p.id === activeId);
    if (!property) return;

    map.flyTo([property.lat, property.lng], Math.max(map.getZoom(), 14), {
      duration: 0.7,
    });
  }, [activeId, properties, map]);

  return null;
}

// ─── Glowing dot icon (low zoom) ─────────────────────────────────────────────

function useGlowIcon(active: boolean) {
  const [icon, setIcon] = React.useState<any>(null);

  React.useEffect(() => {
    import("leaflet").then((L) => {
      const color = active ? "#2463eb" : "#1D4ED8";

      const html = `
        <style>
          @keyframes pinPing {
            75%,100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        </style>

        <div style="
          position:relative;
          width:28px;
          height:28px;
          display:flex;
          align-items:center;
          justify-content:center;
        ">
          
          <!-- Pulse Ring -->
          <div style="
            position:absolute;
            width:28px;
            height:28px;
            border-radius:9999px;
            background:${color};
            opacity:.25;
            animation:pinPing 1.8s cubic-bezier(0,0,0.2,1) infinite;
          "></div>

          <!-- Pin Circle -->
          <div style="
            position:relative;
            width:22px;
            height:22px;
            border-radius:9999px;
            background:${color};
            border:2px solid white;
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow:
              0 0 0 4px rgba(29,158,117,.15),
              0 0 15px rgba(29,158,117,.4);
          ">
            <div style="
              width:6px;
              height:6px;
              border-radius:9999px;
              background:white;
            "></div>
          </div>

        </div>
      `;

      setIcon(
        L.divIcon({
          html,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
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
     const bg     = active ? "#2463eb" : dark ? "#1a2332" : "#ffffff";
const fg     = active ? "#ffffff" : dark ? "#e2e8f0" : "#0f172a";
const border = active ? "#1d4ed8" : dark ? "#2d4a3e" : "#cbd5e1";
const shadow = active
  ? "0 2px 12px rgba(36,99,235,0.5)"
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
  properties, activeId, onSelect, dark, fitTrigger, layoutTrigger,
}: {
  properties: MapProperty[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  dark: boolean;
  fitTrigger: number;
  layoutTrigger: boolean;
}) {
  const [zoom, setZoom] = React.useState(10);
  // Show price bubbles when zoomed in enough, or when there are few listings
  const showPrice = zoom >= 7 || properties.length <= 6;

  return (
    <>
      <ZoomWatcher onZoom={setZoom} />
      <MapBoundsController
        properties={properties}
        fitTrigger={fitTrigger}
        layoutTrigger={layoutTrigger}
      />
      <MapFlyToActive properties={properties} activeId={activeId} />
      {properties.map((p) => {
        const isActive = p.id === activeId;
        const toggle = () => onSelect(isActive ? null : p.id);
        return showPrice ? (
          <PriceMarker key={p.id} property={p} isActive={isActive} onClick={toggle} dark={dark} />
        ) : (
          <GlowMarker key={p.id} property={p} isActive={isActive} onClick={toggle} />
        );
      })}
    </>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({
  status,
  compact,
}: {
  status: MapProperty["status"];
  compact?: boolean;
}) {
  const map = {
    for_sale: {
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
      label: "For sale",
    },
    for_rent: {
      cls: "bg-blue-50 text-blue-700 ring-blue-200/60",
      label: "For rent",
    },
    pending: {
      cls: "bg-amber-50 text-amber-700 ring-amber-200/60",
      label: "Pending",
    },
  } as const;
  const { cls, label } = map[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full font-semibold ring-1 ring-inset",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[10px]",
        cls,
      )}
    >
      {label}
    </span>
  );
}

// ─── Floating popup card ──────────────────────────────────────────────────────

function PopupCard({
  property, onClose, onView, light,
}: {
  property: MapProperty; onClose: () => void; onView: (id: string) => void; light?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto absolute bottom-5 left-1/2 z-[999] w-72 -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl",
        light
          ? "border-slate-200 bg-white"
          : "border-border bg-background",
      )}
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
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
        >
          View property <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Listings sidebar ─────────────────────────────────────────────────────────

function SidebarListingItem({
  property,
  isActive,
  onSelect,
  itemRef,
  light,
}: {
  property: MapProperty;
  isActive: boolean;
  onSelect: () => void;
  itemRef?: React.RefObject<HTMLDivElement | null>;
  light?: boolean;
}) {
  const p = property;

  return (
    <div
      ref={itemRef}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group mx-2 cursor-pointer rounded-xl border p-2.5 transition-all",
        light ? "border-slate-200/80 bg-white" : "border-border/50 bg-card/50",
        isActive
          ? "border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : light
            ? "hover:border-slate-300 hover:shadow-sm"
            : "hover:border-border hover:bg-muted/30",
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-[72px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-slate-100">
          {p.images[0] ? (
            <img
              src={p.images[0]}
              alt={p.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl opacity-30">
              🏢
            </div>
          )}
          {p.isVerified && (
            <span className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 rounded-md bg-emerald-600/95 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
              <BadgeCheck className="h-2.5 w-2.5" />
              Verified
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-sm font-semibold leading-tight text-slate-900">
              {p.title}
            </p>
            {isActive && (
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>

          <p className="flex items-center gap-1 truncate text-[11px] text-slate-500">
            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
            {p.location}
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={p.status} compact />
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
            <span className="text-sm font-bold text-primary">{p.priceLabel}</span>
            {p.ethPrice && (
              <span className="text-[11px] font-medium text-slate-500">{p.ethPrice}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
            {p.beds != null && (
              <span className="inline-flex items-center gap-1">
                <Bed className="h-3 w-3 text-slate-400" />
                {p.beds} bed{p.beds !== 1 ? "s" : ""}
              </span>
            )}
            {p.baths != null && (
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3 w-3 text-slate-400" />
                {p.baths} bath{p.baths !== 1 ? "s" : ""}
              </span>
            )}
            {p.areaSqm != null && (
              <span className="inline-flex items-center gap-1">
                <Maximize2 className="h-3 w-3 text-slate-400" />
                {p.areaSqm.toLocaleString()} ft²
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  properties, activeId, onSelect, light,
}: {
  properties: MapProperty[]; activeId: string | null; onSelect: (id: string) => void; light?: boolean;
}) {
  const activeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeId]);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden border-l",
        light
          ? "border-slate-200 bg-slate-50/80"
          : "border-border/60 bg-background/90 backdrop-blur-sm",
      )}
    >
      <div
        className={cn(
          "border-b px-4 py-3.5",
          light ? "border-slate-200 bg-white" : "border-border/60",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              <span className="text-primary">{properties.length}</span>{" "}
              {properties.length === 1 ? "listing" : "listings"}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Click a card to locate on map
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            <MapPin className="h-3 w-3" />
            Map view
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-2">
        {properties.map((p) => (
          <SidebarListingItem
            key={p.id}
            property={p}
            isActive={p.id === activeId}
            onSelect={() => onSelect(p.id)}
            itemRef={p.id === activeId ? activeRef : undefined}
            light={light}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Collapse toggle ──────────────────────────────────────────────────────────

function CollapseToggle({
  collapsed,
  onToggle,
  light,
}: {
  collapsed: boolean;
  onToggle: () => void;
  light?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? "Show listings" : "Hide listings"}
      className={cn(
        "absolute -left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border shadow-md transition",
        light
          ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          : "border-border bg-background hover:bg-muted",
      )}
    >
      {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function MapBasedListing({
  properties,
  className,
  onViewProperty,
  variant = "default",
}: MapBasedListingProps) {
  const dark = useDarkMode();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [fitTrigger, setFitTrigger] = React.useState(0);

  const validProperties = React.useMemo(
    () =>
      spreadOverlappingCoordinates(
        properties.filter((p) => isValidCoord(p.lat, p.lng)),
      ),
    [properties],
  );

  const activeProperty =
    validProperties.find((p) => p.id === activeId) ?? null;

  const initialCenter = React.useMemo(
    () => getInitialCenter(validProperties),
    [validProperties],
  );
  const initialZoom = getInitialZoom(validProperties.length);

  const isEmbedded = variant === "embedded";

  const tileUrl = isEmbedded
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const handleView = (id: string) => {
    if (onViewProperty) onViewProperty(id);
    else window.location.href = `/properties/${id}`;
  };

  const refitMap = () => {
    setActiveId(null);
    setFitTrigger((n) => n + 1);
  };

  if (validProperties.length === 0) {
    return (
      <div
        className={cn(
          "flex h-[580px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 text-center",
          className,
        )}
      >
        <MapPin className="h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No mappable listings</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Properties need valid coordinates to appear on the map.
        </p>
      </div>
    );
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      <div
        className={cn(
          "relative flex overflow-hidden rounded-2xl border shadow-sm h-[580px]",
          isEmbedded
            ? "border-slate-200 bg-slate-100"
            : "border-border/60",
          className,
        )}
      >
        {/* ── Map pane ──────────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative min-w-0 flex-1 overflow-hidden bg-slate-100",
            isEmbedded && "map-light",
          )}
        >
          <MapContainer
            center={initialCenter}
            zoom={initialZoom}
            minZoom={2}
            maxZoom={18}
            className="h-full w-full z-0"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer key={tileUrl} url={tileUrl} />
            <ZoomControl position="bottomright" />
            <MapMarkers
              properties={validProperties}
              activeId={activeId}
              onSelect={setActiveId}
              dark={variant === "embedded" ? false : dark}
              fitTrigger={fitTrigger}
              layoutTrigger={sidebarCollapsed}
            />
          </MapContainer>

          {activeProperty && (
            <PopupCard
              property={activeProperty}
              onClose={() => setActiveId(null)}
              onView={handleView}
              light={isEmbedded}
            />
          )}

          <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2">
            <div
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm select-none",
                isEmbedded
                  ? "border-slate-200 bg-white/95 text-slate-600"
                  : "border-border/60 bg-background/90 text-muted-foreground",
              )}
            >
              {validProperties.length} on map · click a pin
            </div>
            <button
              type="button"
              onClick={refitMap}
              title="Fit all listings"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition",
                isEmbedded
                  ? "border-slate-200 bg-white/95 text-slate-600 hover:text-slate-900"
                  : "border-border/60 bg-background/90 text-muted-foreground hover:text-foreground",
              )}
            >
              <LocateFixed className="h-4 w-4" />
            </button>
          </div>

          <p className="absolute bottom-1 right-12 z-[1000] select-none text-[10px] text-muted-foreground/50">
            © CARTO © OpenStreetMap
          </p>
        </div>

        {/* ── Listings sidebar ───────────────────────────────────────────── */}
        <div
          className={cn(
            "relative shrink-0 transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-72 sm:w-80",
          )}
        >
          <CollapseToggle
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
            light={isEmbedded}
          />
          <div className="h-full w-72 sm:w-80">
            <Sidebar
              properties={validProperties}
              activeId={activeId}
              onSelect={(id) => setActiveId((prev) => (prev === id ? null : id))}
              light={isEmbedded}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default MapBasedListing;
