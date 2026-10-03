type Geometry = {
  type: string;
  coordinates: unknown;
};

export type StationWx = {
  text: string;
  tempF: number | null;
  windMph: number | null;
  gustMph: number | null;
  humidity: number | null;
  timestamp: string | null;
  station: string;
};

export type NwsAlert = {
  id: string;
  event: string;
  headline: string;
  severity: string;
  area: string;
  ends: string | null;
  geometry: Geometry | null;
};

export type StormReport = {
  id: string;
  type: string;
  city: string;
  magnitude: string;
  remark: string;
  valid: string;
  lng: number;
  lat: number;
};

function cToF(v: number | null | undefined) {
  return v == null ? null : Math.round((v * 9) / 5 + 32);
}

function toMph(value: number | null | undefined, unit?: string | null) {
  if (value == null) return null;
  if (unit?.includes("m_s")) return Math.round(value * 2.23694);
  if (unit?.includes("km_h")) return Math.round(value * 0.621371);
  return Math.round(value);
}

const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "Atlas Storm OS" };

export async function fetchStationWx(signal?: AbortSignal): Promise<StationWx> {
  const res = await fetch("https://api.weather.gov/stations/KFWS/observations/latest", {
    signal,
    headers: NWS_HEADERS,
  });
  if (!res.ok) throw new Error(`NWS obs ${res.status}`);
  const json = (await res.json()) as {
    properties?: {
      textDescription?: string;
      timestamp?: string;
      temperature?: { value?: number | null };
      windSpeed?: { value?: number | null; unitCode?: string };
      windGust?: { value?: number | null; unitCode?: string };
      relativeHumidity?: { value?: number | null };
    };
  };
  const p = json.properties ?? {};
  return {
    text: p.textDescription || "Observation",
    tempF: cToF(p.temperature?.value),
    windMph: toMph(p.windSpeed?.value, p.windSpeed?.unitCode),
    gustMph: toMph(p.windGust?.value, p.windGust?.unitCode),
    humidity: p.relativeHumidity?.value == null ? null : Math.round(p.relativeHumidity.value),
    timestamp: p.timestamp ?? null,
    station: "KFWS",
  };
}

export async function fetchNwsAlerts(signal?: AbortSignal): Promise<NwsAlert[]> {
  const res = await fetch("https://api.weather.gov/alerts/active?area=TX", {
    signal,
    headers: NWS_HEADERS,
  });
  if (!res.ok) throw new Error(`NWS alerts ${res.status}`);
  const json = (await res.json()) as {
    features?: Array<{
      id?: string;
      geometry?: Geometry | null;
      properties?: {
        event?: string;
        headline?: string;
        severity?: string;
        areaDesc?: string;
        ends?: string | null;
        id?: string;
      };
    }>;
  };
  return (json.features ?? []).map((f, i) => ({
    id: String(f.properties?.id ?? f.id ?? i),
    event: f.properties?.event ?? "Alert",
    headline: f.properties?.headline ?? "",
    severity: f.properties?.severity ?? "Unknown",
    area: f.properties?.areaDesc ?? "",
    ends: f.properties?.ends ?? null,
    geometry: f.geometry ?? null,
  }));
}

export async function fetchStormReports(signal?: AbortSignal): Promise<StormReport[]> {
  const res = await fetch("https://mesonet.agron.iastate.edu/geojson/lsr.geojson?hours=24", {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`IEM LSR ${res.status}`);
  const json = (await res.json()) as {
    features?: Array<{
      id?: string | number;
      geometry?: { coordinates?: number[] };
      properties?: {
        typetext?: string;
        city?: string;
        magnitude?: string | number;
        remark?: string;
        valid?: string;
      };
    }>;
  };

  const wanted = /HAIL|TSTM|TORN|WIND DMG|WIND GST/;
  return (json.features ?? [])
    .map((f, i) => {
      const coords = f.geometry?.coordinates;
      const lng = coords?.[0];
      const lat = coords?.[1];
      return {
        id: String(f.id ?? i),
        type: f.properties?.typetext ?? "REPORT",
        city: f.properties?.city ?? "",
        magnitude: String(f.properties?.magnitude ?? ""),
        remark: f.properties?.remark ?? "",
        valid: f.properties?.valid ?? "",
        lng: typeof lng === "number" ? lng : 0,
        lat: typeof lat === "number" ? lat : 0,
      };
    })
    .filter((r) => wanted.test(r.type) && r.lng && r.lat);
}

export function alertsToGeoJSON(alerts: NwsAlert[]) {
  return {
    type: "FeatureCollection" as const,
    features: alerts
      .filter((a) => a.geometry)
      .map((a) => ({
        type: "Feature" as const,
        id: a.id,
        properties: {
          id: a.id,
          event: a.event,
          severity: a.severity,
        },
        geometry: a.geometry as Geometry,
      })),
  };
}

export function reportsToGeoJSON(reports: StormReport[]) {
  return {
    type: "FeatureCollection" as const,
    features: reports.map((r) => ({
      type: "Feature" as const,
      id: r.id,
      properties: {
        id: r.id,
        type: r.type,
        city: r.city,
        magnitude: r.magnitude,
      },
      geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] as [number, number] },
    })),
  };
}

export function isHailish(type: string) {
  return /HAIL/.test(type);
}

export type OutlookCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { label: string; label2: string; fill: string; stroke: string };
    geometry: Geometry;
  }>;
};

export const EMPTY_OUTLOOK: OutlookCollection = { type: "FeatureCollection", features: [] };

const SPC_URL = {
  cat: "https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson",
  hail: "https://www.spc.noaa.gov/products/outlook/day1otlk_hail.nolyr.geojson",
} as const;

function hexColor(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}

export async function fetchSpcOutlook(
  kind: keyof typeof SPC_URL,
  signal?: AbortSignal,
): Promise<OutlookCollection> {
  const res = await fetch(SPC_URL[kind], {
    signal,
    headers: { Accept: "application/geo+json" },
  });
  if (!res.ok) throw new Error(`SPC ${kind} ${res.status}`);
  const json = (await res.json()) as {
    features?: Array<{
      geometry?: Geometry | null;
      properties?: {
        LABEL?: string;
        LABEL2?: string;
        fill?: string;
        stroke?: string;
      };
    }>;
  };
  return {
    type: "FeatureCollection",
    features: (json.features ?? []).flatMap((feature) => {
      const fill = feature.properties?.fill;
      if (!feature.geometry || typeof fill !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(fill)) {
        return [];
      }
      return [
        {
          type: "Feature" as const,
          properties: {
            label: feature.properties?.LABEL ?? "Outlook",
            label2: feature.properties?.LABEL2 ?? "",
            fill,
            stroke: hexColor(feature.properties?.stroke, fill),
          },
          geometry: feature.geometry,
        },
      ];
    }),
  };
}

export type PlaceHit = {
  id: string;
  label: string;
  lng: number;
  lat: number;
};

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const [places, streets] = await Promise.all([
    searchOpenMeteo(q, signal).catch(() => [] as PlaceHit[]),
    /\d/.test(q) ? searchCensus(q, signal).catch(() => [] as PlaceHit[]) : Promise.resolve([]),
  ]);
  const seen = new Set<string>();
  const hits: PlaceHit[] = [];
  for (const hit of [...streets, ...places]) {
    const key = `${hit.lat.toFixed(2)},${hit.lng.toFixed(2)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    hits.push(hit);
  }
  return hits.slice(0, 6);
}

async function searchOpenMeteo(q: string, signal?: AbortSignal): Promise<PlaceHit[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Geocoder ${res.status}`);
  const json = (await res.json()) as {
    results?: Array<{
      id?: number;
      name?: string;
      admin1?: string;
      country_code?: string;
      latitude?: number;
      longitude?: number;
    }>;
  };
  return (json.results ?? [])
    .flatMap((row) => {
      if (typeof row.latitude !== "number" || typeof row.longitude !== "number" || !row.name) {
        return [];
      }
      const where = [row.name, row.admin1].filter(Boolean).join(", ");
      return [
        {
          id: `om-${row.id ?? where}`,
          label: where,
          lng: row.longitude,
          lat: row.latitude,
          us: row.country_code === "US",
        },
      ];
    })
    .sort((a, b) => Number(b.us) - Number(a.us))
    .map(({ us: _us, ...hit }) => hit);
}

async function searchCensus(q: string, signal?: AbortSignal): Promise<PlaceHit[]> {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
  url.searchParams.set("address", q);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Census ${res.status}`);
  const json = (await res.json()) as {
    result?: {
      addressMatches?: Array<{
        matchedAddress?: string;
        coordinates?: { x?: number; y?: number };
      }>;
    };
  };
  return (json.result?.addressMatches ?? []).flatMap((row, index) => {
    const lng = row.coordinates?.x;
    const lat = row.coordinates?.y;
    if (typeof lng !== "number" || typeof lat !== "number" || !row.matchedAddress) return [];
    return [{ id: `census-${index}`, label: row.matchedAddress, lng, lat }];
  });
}

export type PointBrief = {
  lng: number;
  lat: number;
  place: string;
  office: string;
  tempF: number | null;
  wind: string;
  forecast: string;
  gustMph: number | null;
  precipIn: number | null;
  cape: number | null;
};

function trustedForecast(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "api.weather.gov") return null;
    if (!url.pathname.startsWith("/gridpoints/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function fetchPointBrief(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<PointBrief> {
  const pointUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`;
  const meteoUrl = new URL("https://api.open-meteo.com/v1/forecast");
  meteoUrl.searchParams.set("latitude", lat.toFixed(4));
  meteoUrl.searchParams.set("longitude", lng.toFixed(4));
  meteoUrl.searchParams.set("hourly", "precipitation,wind_gusts_10m,cape");
  meteoUrl.searchParams.set("forecast_days", "1");
  meteoUrl.searchParams.set("temperature_unit", "fahrenheit");
  meteoUrl.searchParams.set("wind_speed_unit", "mph");
  meteoUrl.searchParams.set("precipitation_unit", "inch");

  const [pointRes, meteoRes] = await Promise.all([
    fetch(pointUrl, { signal, headers: NWS_HEADERS }),
    fetch(meteoUrl, { signal, headers: { Accept: "application/json" } }),
  ]);
  if (!pointRes.ok) throw new Error(`NWS point ${pointRes.status}`);

  const point = (await pointRes.json()) as {
    properties?: {
      cwa?: string;
      forecast?: string;
      relativeLocation?: { properties?: { city?: string; state?: string } };
    };
  };
  const city = point.properties?.relativeLocation?.properties?.city;
  const state = point.properties?.relativeLocation?.properties?.state;
  const forecastUrl = trustedForecast(point.properties?.forecast);
  let tempF: number | null = null;
  let wind = "—";
  let forecast = "Gridpoint forecast quiet";
  if (forecastUrl) {
    const forecastRes = await fetch(forecastUrl, { signal, headers: NWS_HEADERS });
    if (forecastRes.ok) {
      const body = (await forecastRes.json()) as {
        properties?: {
          periods?: Array<{
            temperature?: number;
            windSpeed?: string;
            shortForecast?: string;
          }>;
        };
      };
      const period = body.properties?.periods?.[0];
      if (period) {
        tempF = typeof period.temperature === "number" ? period.temperature : null;
        wind = period.windSpeed ?? "—";
        forecast = period.shortForecast ?? forecast;
      }
    }
  }

  let gustMph: number | null = null;
  let precipIn: number | null = null;
  let cape: number | null = null;
  if (meteoRes.ok) {
    const meteo = (await meteoRes.json()) as {
      hourly?: {
        precipitation?: Array<number | null>;
        wind_gusts_10m?: Array<number | null>;
        cape?: Array<number | null>;
      };
    };
    const rain = (meteo.hourly?.precipitation ?? [])
      .slice(0, 6)
      .filter((n): n is number => n != null);
    const gusts = (meteo.hourly?.wind_gusts_10m ?? [])
      .slice(0, 6)
      .filter((n): n is number => n != null);
    const capes = (meteo.hourly?.cape ?? []).slice(0, 6).filter((n): n is number => n != null);
    precipIn = rain.length ? Math.round(rain.reduce((sum, n) => sum + n, 0) * 100) / 100 : null;
    gustMph = gusts.length ? Math.round(Math.max(...gusts)) : null;
    cape = capes.length ? Math.round(Math.max(...capes)) : null;
  }

  return {
    lng,
    lat,
    place: city && state ? `${city}, ${state}` : `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    office: point.properties?.cwa ?? "NWS",
    tempF,
    wind,
    forecast,
    gustMph,
    precipIn,
    cape,
  };
}
