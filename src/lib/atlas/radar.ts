export type RadarProduct =
  | "n0q"
  | "eet"
  | "n1p"
  | "composite"
  | "goes-vis"
  | "goes-ir"
  | "site-ref"
  | "site-vel"
  | "site-srv"
  | "site-et"
  | "site-vil"
  | "site-hca";

export type RadarLegend = "ref" | "vel" | "et" | "vil" | "hca" | "precip" | "sat";

export type RadarFrame = {
  time: number;
  tiles: string[];
  maxzoom: number;
  tileSize: number;
  provider: "iem" | "rainviewer" | "goes" | "ridge";
  label: string;
  forecast: boolean;
  legend: RadarLegend;
  credit: string;
  note: string;
};

export type RadarSite = {
  id: string;
  name: string;
  kind: "88d" | "tdwr";
  lng: number;
  lat: number;
  rangeKm: number;
};

const IEM = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";
const RAINVIEWER_DISCOVERY = "https://api.rainviewer.com/public/weather-maps.json";
const IEM_STEPS = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0] as const;

export const RADAR_SITES: RadarSite[] = [
  { id: "KFWS", name: "Fort Worth", kind: "88d", lng: -97.303, lat: 32.573, rangeKm: 230 },
  { id: "KGRK", name: "Granger", kind: "88d", lng: -97.383, lat: 30.722, rangeKm: 230 },
  { id: "KDYX", name: "Dyess", kind: "88d", lng: -99.254, lat: 32.538, rangeKm: 230 },
  { id: "KFDR", name: "Frederick", kind: "88d", lng: -98.977, lat: 34.362, rangeKm: 230 },
  { id: "KEWX", name: "New Braunfels", kind: "88d", lng: -98.029, lat: 29.704, rangeKm: 230 },
  { id: "KSHV", name: "Shreveport", kind: "88d", lng: -93.841, lat: 32.451, rangeKm: 230 },
  { id: "TDFW", name: "DFW airport", kind: "tdwr", lng: -97.038, lat: 32.923, rangeKm: 90 },
  { id: "TDAL", name: "Love Field", kind: "tdwr", lng: -96.851, lat: 32.845, rangeKm: 90 },
];

export const PRODUCT_GROUPS: {
  id: string;
  label: string;
  products: { id: RadarProduct; label: string; hint: string }[];
}[] = [
  {
    id: "mosaic",
    label: "Mosaic",
    products: [
      { id: "n0q", label: "Reflectivity", hint: "NEXRAD composite" },
      { id: "eet", label: "Echo tops", hint: "Storm height" },
      { id: "n1p", label: "1-hour rain", hint: "MRMS Q2" },
      { id: "composite", label: "Global", hint: "RainViewer" },
    ],
  },
  {
    id: "site",
    label: "Site sweep",
    products: [
      { id: "site-ref", label: "Reflectivity", hint: "N0Q / TR0" },
      { id: "site-vel", label: "Velocity", hint: "N0U / TV0" },
      { id: "site-srv", label: "Storm relative", hint: "N0S" },
      { id: "site-et", label: "Echo tops", hint: "NET" },
      { id: "site-vil", label: "VIL", hint: "N0Z" },
      { id: "site-hca", label: "Hydrometeors", hint: "HHC" },
    ],
  },
  {
    id: "sky",
    label: "Satellite",
    products: [
      { id: "goes-vis", label: "Visible", hint: "GOES-East" },
      { id: "goes-ir", label: "Infrared", hint: "GOES-East" },
    ],
  },
];

export const PRODUCTS = PRODUCT_GROUPS.flatMap((group) => group.products);

const SITE_IDS = new Set(RADAR_SITES.map((site) => site.id));

export function radarSite(id: string) {
  return RADAR_SITES.find((site) => site.id === id) ?? RADAR_SITES[0];
}

export function siteSupports(site: RadarSite, product: RadarProduct) {
  if (!product.startsWith("site-")) return true;
  if (site.kind === "88d") return true;
  return product === "site-ref" || product === "site-vel";
}

function legendFor(product: RadarProduct): RadarLegend {
  if (product === "site-vel" || product === "site-srv") return "vel";
  if (product === "eet" || product === "site-et") return "et";
  if (product === "site-vil") return "vil";
  if (product === "site-hca") return "hca";
  if (product === "n1p") return "precip";
  if (product === "goes-vis" || product === "goes-ir") return "sat";
  return "ref";
}

function frame(
  partial: Omit<RadarFrame, "legend" | "forecast" | "note"> & {
    legend?: RadarLegend;
    forecast?: boolean;
    note?: string;
    product: RadarProduct;
  },
): RadarFrame {
  return {
    time: partial.time,
    tiles: partial.tiles,
    maxzoom: partial.maxzoom,
    tileSize: partial.tileSize,
    provider: partial.provider,
    label: partial.label,
    forecast: partial.forecast ?? false,
    legend: partial.legend ?? legendFor(partial.product),
    credit: partial.credit,
    note: partial.note ?? "",
  };
}

function iemLayer(product: "n0q" | "eet", minutesAgo: number) {
  const base = product === "n0q" ? "nexrad-n0q-900913" : "nexrad-eet-900913";
  if (minutesAgo === 0) return base;
  return `${base}-m${String(minutesAgo).padStart(2, "0")}m`;
}

function iemFrames(product: "n0q" | "eet"): RadarFrame[] {
  const now = Math.floor(Date.now() / 1000);
  return IEM_STEPS.map((minutesAgo) =>
    frame({
      product,
      time: now - minutesAgo * 60,
      tiles: [`${IEM}/${iemLayer(product, minutesAgo)}/{z}/{x}/{y}.png`],
      maxzoom: product === "n0q" ? 12 : 8,
      tileSize: 256,
      provider: "iem",
      label: minutesAgo === 0 ? "Live" : `−${minutesAgo}m`,
      credit: "IEM · NWS NEXRAD",
    }),
  );
}

function singleFrame(
  product: RadarProduct,
  layer: string,
  maxzoom: number,
  provider: RadarFrame["provider"],
  credit: string,
  note = "",
): RadarFrame[] {
  return [
    frame({
      product,
      time: Math.floor(Date.now() / 1000),
      tiles: [`${IEM}/${layer}/{z}/{x}/{y}.png`],
      maxzoom,
      tileSize: 256,
      provider,
      label: "Latest",
      credit,
      note,
    }),
  ];
}

function siteFrames(product: RadarProduct, siteId: string): RadarFrame[] {
  const site = radarSite(SITE_IDS.has(siteId) ? siteId : "KFWS");
  const supported = siteSupports(site, product);
  const moment = supported ? product : "site-ref";
  const moments: Record<string, string> = {
    "site-ref": "N0Q",
    "site-vel": "N0U",
    "site-srv": "N0S",
    "site-et": "NET",
    "site-vil": "N0Z",
    "site-hca": "HHC",
  };
  const code =
    site.kind === "tdwr" ? (moment === "site-vel" ? "TV0" : "TR0") : (moments[moment] ?? "N0Q");
  const note = supported
    ? `${site.id} ${code} · ${site.kind === "tdwr" ? "TDWR" : "WSR-88D"}`
    : `${site.id} has no ${product.replace("site-", "")} sweep. Showing reflectivity.`;
  return singleFrame(
    product,
    `ridge::${site.id}-${code}`,
    10,
    "ridge",
    "IEM RIDGE · NWS",
    note,
  );
}

function trustedHost(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:") return null;
    if (host !== "rainviewer.com" && !host.endsWith(".rainviewer.com")) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function seedFrames(product: RadarProduct, siteId = "KFWS"): RadarFrame[] {
  if (product === "n0q" || product === "eet") return iemFrames(product);
  if (product === "n1p") {
    return singleFrame(product, "q2-n1p-900913", 9, "iem", "IEM · MRMS Q2 1-hour precip");
  }
  if (product === "goes-vis") {
    return singleFrame(product, "goes-east-vis-1km-900913", 8, "goes", "IEM · GOES-East visible");
  }
  if (product === "goes-ir") {
    return singleFrame(product, "goes-east-ir-4km-900913", 6, "goes", "IEM · GOES-East infrared");
  }
  if (product.startsWith("site-")) return siteFrames(product, siteId);
  return [];
}

function rainFrames(
  host: string,
  items: Array<{ time?: unknown; path?: unknown }>,
  forecast: boolean,
): RadarFrame[] {
  return items.flatMap((item) => {
    if (typeof item.time !== "number" || typeof item.path !== "string") return [];
    if (!/^\/v2\/radar\/[A-Za-z0-9_-]+$/.test(item.path)) return [];
    return [
      frame({
        product: "composite",
        time: item.time,
        tiles: [`${host}${item.path}/256/{z}/{x}/{y}/5/1_1.png`],
        maxzoom: 7,
        tileSize: 256,
        provider: "rainviewer",
        label: forecast
          ? `+${new Date(item.time * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}`
          : new Date(item.time * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }),
        forecast,
        credit: forecast ? "RainViewer nowcast" : "RainViewer composite",
      }),
    ];
  });
}

export async function fetchRadarFrames(
  product: RadarProduct,
  siteId = "KFWS",
  signal?: AbortSignal,
): Promise<RadarFrame[]> {
  if (product !== "composite") return seedFrames(product, siteId);

  const res = await fetch(RAINVIEWER_DISCOVERY, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RainViewer ${res.status}`);
  const payload = (await res.json()) as {
    host?: unknown;
    radar?: {
      past?: Array<{ time?: unknown; path?: unknown }>;
      nowcast?: Array<{ time?: unknown; path?: unknown }>;
    };
  };
  const host = trustedHost(payload.host);
  if (!host) return [];
  const past = rainFrames(host, payload.radar?.past ?? [], false);
  const nowcast = rainFrames(host, payload.radar?.nowcast ?? [], true);
  return [...past, ...nowcast].sort((a, b) => a.time - b.time);
}

export function formatFrameClock(time: number) {
  return new Date(time * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function frameAge(time: number) {
  const min = Math.round((Date.now() / 1000 - time) / 60);
  if (min < -1) return `in ${Math.abs(min)} min`;
  if (min < 1) return "just now";
  if (min === 1) return "1 min ago";
  return `${min} min ago`;
}
