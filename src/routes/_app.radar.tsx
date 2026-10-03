"use client";

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { OpsMap } from "@/components/atlas/ops-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROPERTIES, STORMS, propertiesForStorm } from "@/lib/atlas/data";
import { useNwsAlerts, useStationWx, useStormReports } from "@/lib/atlas/live";
import type { AtlasBasemap } from "@/lib/atlas/map-style";
import {
  PRODUCT_GROUPS,
  RADAR_SITES,
  radarSite,
  siteSupports,
  type RadarProduct,
} from "@/lib/atlas/radar";
import { fetchPointBrief, isHailish, searchPlaces, type PlaceHit, type PointBrief } from "@/lib/atlas/weather";
import { useAtlas } from "@/lib/atlas/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/radar")({
  component: RadarPage,
});

const SPEEDS = [
  { ms: 1100, label: "Slow" },
  { ms: 700, label: "Loop" },
  { ms: 350, label: "Fast" },
] as const;

function RadarPage() {
  const [product, setProduct] = useState<RadarProduct>("n0q");
  const [siteId, setSiteId] = useState("KFWS");
  const [basemap, setBasemap] = useState<AtlasBasemap>("ops");
  const [showRadar, setShowRadar] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showOutlook, setShowOutlook] = useState(false);
  const [showHail, setShowHail] = useState(false);
  const [showRings, setShowRings] = useState(true);
  const [opacity, setOpacity] = useState(0.72);
  const [loopMs, setLoopMs] = useState(700);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceHit[]>([]);
  const [camera, setCamera] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [brief, setBrief] = useState<PointBrief | null>(null);
  const [briefState, setBriefState] = useState<"idle" | "loading" | "error">("idle");

  const mapFocus = useAtlas((s) => s.mapFocus);
  const stormId = useAtlas((s) => s.selectedStormId);
  const selectStorm = useAtlas((s) => s.selectStorm);
  const selectProperty = useAtlas((s) => s.selectProperty);
  const selectedPropertyId = useAtlas((s) => s.selectedPropertyId);
  const storm = STORMS.find((s) => s.id === stormId) ?? STORMS[0];
  const site = radarSite(siteId);
  const wx = useStationWx();
  const alerts = useNwsAlerts();
  const reports = useStormReports();
  const localReports = useMemo(
    () =>
      reports.data.filter(
        (r) => r.lat > 32.35 && r.lat < 33.15 && r.lng > -97.55 && r.lng < -96.55,
      ),
    [reports.data],
  );

  useEffect(() => {
    if (!mapFocus) return;
    setCamera({ center: [mapFocus.lng, mapFocus.lat], zoom: mapFocus.zoom });
  }, [mapFocus]);

  useEffect(() => {
    if (siteSupports(site, product)) return;
    setProduct("site-ref");
  }, [site, product]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setPlaces([]);
      return;
    }
    const ctrl = new AbortController();
    const id = window.setTimeout(() => {
      void searchPlaces(q, ctrl.signal)
        .then(setPlaces)
        .catch(() => setPlaces([]));
    }, 280);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, [query]);

  function inspect(point: { lng: number; lat: number }) {
    setBriefState("loading");
    setBrief({
      lng: point.lng,
      lat: point.lat,
      place: `${point.lat.toFixed(2)}, ${point.lng.toFixed(2)}`,
      office: "NWS",
      tempF: null,
      wind: "—",
      forecast: "Reading the gridpoint…",
      gustMph: null,
      precipIn: null,
      cape: null,
    });
    void fetchPointBrief(point.lat, point.lng)
      .then((next) => {
        setBrief(next);
        setBriefState("idle");
      })
      .catch(() => setBriefState("error"));
  }

  function flyToSite(id: string) {
    const next = radarSite(id);
    setSiteId(id);
    setCamera({
      center: [next.lng, next.lat],
      zoom: next.kind === "tdwr" ? 10 : 8,
    });
    if (!product.startsWith("site-") && product !== "goes-vis" && product !== "goes-ir") {
      setProduct("site-ref");
    }
  }

  return (
    <div className="atlas-map-stage -mx-4 -my-6 flex flex-col lg:flex-row sm:-mx-6 lg:-mx-8">
      <div className="relative min-h-96 flex-1 lg:min-h-0">
        <OpsMap
          className="absolute inset-0 h-full min-h-96 rounded-none"
          storms={STORMS}
          properties={PROPERTIES}
          focusId={selectedPropertyId}
          onSelect={selectProperty}
          onInspect={inspect}
          product={product}
          siteId={siteId}
          basemap={basemap}
          showRadar={showRadar}
          showAlerts={showAlerts}
          showReports={showReports}
          showOutlook={showOutlook}
          showHail={showHail}
          showRings={showRings}
          opacity={opacity}
          loopMs={loopMs}
          inspect={brief}
          center={camera?.center}
          zoom={camera?.zoom}
        />
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-border bg-background p-4 lg:w-80 lg:border-l lg:border-t-0">
        <header>
          <p className="font-mono text-xs uppercase tracking-wider text-faint">Live radar</p>
          <h1 className="font-display text-3xl tracking-tight">The sweep, not a sketch.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            NEXRAD mosaic and RIDGE site moments from IEM, GOES-East, MRMS rain, RainViewer
            composite, SPC day-1 polygons, NWS alerts.
          </p>
        </header>

        <div className="relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, town, or street address"
            aria-label="Search the map"
          />
          {places.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md bg-popover p-1 shadow-[var(--shadow-border)]">
              {places.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center rounded-sm px-3 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      setQuery("");
                      setPlaces([]);
                      setCamera({ center: [place.lng, place.lat], zoom: 12 });
                      inspect({ lng: place.lng, lat: place.lat });
                    }}
                  >
                    {place.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {wx.data && (
          <div className="rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-xs uppercase tracking-wider text-faint">
              {wx.data.station} · Fort Worth
            </p>
            <p className="mt-1 font-display text-2xl">
              {wx.data.tempF ?? "—"}° · {wx.data.text}
            </p>
            <p className="text-sm text-muted-foreground">
              Wind {wx.data.windMph ?? "—"} mph
              {wx.data.gustMph ? ` gust ${wx.data.gustMph}` : ""}
              {wx.data.humidity != null ? ` · ${wx.data.humidity}% rh` : ""}
            </p>
          </div>
        )}

        {brief && (
          <div className="rounded-lg bg-card p-4 shadow-[var(--shadow-border)]">
            <p className="font-mono text-xs uppercase tracking-wider text-faint">
              {brief.office} gridpoint
              {briefState === "loading" ? " · reading" : ""}
              {briefState === "error" ? " · quiet" : ""}
            </p>
            <p className="mt-1 font-medium">{brief.place}</p>
            <p className="font-display text-2xl">
              {brief.tempF ?? "—"}° · {brief.forecast}
            </p>
            <p className="text-sm text-muted-foreground">
              Wind {brief.wind}
              {brief.gustMph != null ? ` · gust ${brief.gustMph} mph` : ""}
              {brief.precipIn != null ? ` · ${brief.precipIn}" next 6h` : ""}
              {brief.cape != null ? ` · CAPE ${brief.cape}` : ""}
            </p>
          </div>
        )}

        {PRODUCT_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-faint">
              {group.label}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {group.products.map((item) => {
                const disabled = item.id.startsWith("site-") && !siteSupports(site, item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setProduct(item.id)}
                    className={cn(
                      "min-h-11 rounded-md px-2 text-left text-xs",
                      product === item.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                      disabled && "opacity-40",
                    )}
                  >
                    <span className="block font-medium">{item.label}</span>
                    <span className="block opacity-70">{item.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-faint">
            Radar site · {site.kind === "tdwr" ? "TDWR" : "WSR-88D"}
          </p>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {RADAR_SITES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => flyToSite(item.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-md px-3 text-left",
                  item.id === site.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <span className="block font-mono text-xs">{item.id}</span>
                <span className="block text-xs">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["ops", "Ops"],
              ["sat", "Satellite"],
              ["streets", "Streets"],
            ] as const
          ).map(([id, label]) => (
            <Toggle key={id} pressed={basemap === id} onPressed={() => setBasemap(id)}>
              {label}
            </Toggle>
          ))}
          <Toggle pressed={showRadar} onPressed={() => setShowRadar((v) => !v)}>
            Radar
          </Toggle>
          <Toggle pressed={showAlerts} onPressed={() => setShowAlerts((v) => !v)}>
            Alerts
          </Toggle>
          <Toggle pressed={showReports} onPressed={() => setShowReports((v) => !v)}>
            LSR
          </Toggle>
          <Toggle pressed={showOutlook} onPressed={() => setShowOutlook((v) => !v)}>
            SPC
          </Toggle>
          <Toggle pressed={showHail} onPressed={() => setShowHail((v) => !v)}>
            Hail risk
          </Toggle>
          <Toggle pressed={showRings} onPressed={() => setShowRings((v) => !v)}>
            Range rings
          </Toggle>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-faint">
              Opacity
            </span>
            <input
              type="range"
              min={0.25}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Radar opacity"
            />
          </label>
          <div>
            <p className="mb-1 font-mono text-xs uppercase tracking-wider text-faint">Speed</p>
            <div className="grid grid-cols-3 gap-1">
              {SPEEDS.map((speed) => (
                <button
                  key={speed.ms}
                  type="button"
                  onClick={() => setLoopMs(speed.ms)}
                  className={cn(
                    "min-h-11 rounded-md text-xs",
                    loopMs === speed.ms
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {STORMS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectStorm(s.id)}
              className={cn(
                "rounded-lg p-3 text-left shadow-[var(--shadow-border)]",
                s.id === storm.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
              )}
            >
              <p className="font-medium">{s.name}</p>
              <p className="text-xs opacity-80">
                {s.hailIn}" hail · {s.windMph} mph
              </p>
            </button>
          ))}
        </div>

        <section>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-faint">
            NWS Texas · {alerts.data.length}
          </p>
          <ul className="flex flex-col gap-2">
            {alerts.data.slice(0, 4).map((a) => (
              <li key={a.id} className="rounded-md bg-card p-3 text-sm shadow-[var(--shadow-border)]">
                <p className="font-medium">{a.event}</p>
                <p className="text-xs text-muted-foreground">{a.area.split(";")[0]}</p>
              </li>
            ))}
            {alerts.status === "error" && (
              <li className="text-sm text-muted-foreground">Alerts feed quiet.</li>
            )}
          </ul>
        </section>

        <section>
          <p className="mb-2 font-mono text-xs uppercase tracking-wider text-faint">
            DFW reports · {localReports.length}
          </p>
          <ul className="flex flex-col gap-2">
            {localReports.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-2 text-sm">
                <span>
                  <span className="block">{r.city || r.type}</span>
                  <span className="block text-xs text-muted-foreground">{r.type}</span>
                </span>
                <Badge variant={isHailish(r.type) ? "bad" : "warn"}>{r.magnitude || "—"}</Badge>
              </li>
            ))}
            {localReports.length === 0 && (
              <li className="text-sm text-muted-foreground">No hail or wind LSR in the metro.</li>
            )}
          </ul>
        </section>

        <p className="text-xs text-muted-foreground">
          Pictures come from public tiles. Level II gate decode, the thing OpenRadar and Py-ART do
          on a workstation, is not re-run in the browser. The moments, rings, and outlook colours
          follow those desks.
        </p>

        <Button asChild variant="secondary">
          <Link to="/recon">
            Score {propertiesForStorm(storm.id).length} roofs in {storm.region}
          </Link>
        </Button>
      </aside>
    </div>
  );
}

function Toggle({
  pressed,
  onPressed,
  children,
}: {
  pressed: boolean;
  onPressed: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onPressed}
      className={cn(
        "min-h-11 rounded-md px-3 text-sm",
        pressed ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
