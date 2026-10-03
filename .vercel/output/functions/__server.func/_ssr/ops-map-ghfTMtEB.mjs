import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Pause, l as Play } from "../_libs/lucide-react.mjs";
import { i as cn } from "./router-CmP8cOMd.mjs";
import { i as STORMS, r as PROPERTIES } from "./data-DyH99hDQ.mjs";
import { a as fetchSpcOutlook, l as reportsToGeoJSON, n as alertsToGeoJSON, o as fetchStationWx, r as fetchNwsAlerts, s as fetchStormReports, t as EMPTY_OUTLOOK } from "./weather-CE_Wyfd0.mjs";
import { t as dpsTone } from "./format-CLSTmkq8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ops-map-ghfTMtEB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var IEM = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";
var RAINVIEWER_DISCOVERY = "https://api.rainviewer.com/public/weather-maps.json";
var IEM_STEPS = [
	50,
	45,
	40,
	35,
	30,
	25,
	20,
	15,
	10,
	5,
	0
];
var RADAR_SITES = [
	{
		id: "KFWS",
		name: "Fort Worth",
		kind: "88d",
		lng: -97.303,
		lat: 32.573,
		rangeKm: 230
	},
	{
		id: "KGRK",
		name: "Granger",
		kind: "88d",
		lng: -97.383,
		lat: 30.722,
		rangeKm: 230
	},
	{
		id: "KDYX",
		name: "Dyess",
		kind: "88d",
		lng: -99.254,
		lat: 32.538,
		rangeKm: 230
	},
	{
		id: "KFDR",
		name: "Frederick",
		kind: "88d",
		lng: -98.977,
		lat: 34.362,
		rangeKm: 230
	},
	{
		id: "KEWX",
		name: "New Braunfels",
		kind: "88d",
		lng: -98.029,
		lat: 29.704,
		rangeKm: 230
	},
	{
		id: "KSHV",
		name: "Shreveport",
		kind: "88d",
		lng: -93.841,
		lat: 32.451,
		rangeKm: 230
	},
	{
		id: "TDFW",
		name: "DFW airport",
		kind: "tdwr",
		lng: -97.038,
		lat: 32.923,
		rangeKm: 90
	},
	{
		id: "TDAL",
		name: "Love Field",
		kind: "tdwr",
		lng: -96.851,
		lat: 32.845,
		rangeKm: 90
	}
];
var PRODUCT_GROUPS = [
	{
		id: "mosaic",
		label: "Mosaic",
		products: [
			{
				id: "n0q",
				label: "Reflectivity",
				hint: "NEXRAD composite"
			},
			{
				id: "eet",
				label: "Echo tops",
				hint: "Storm height"
			},
			{
				id: "n1p",
				label: "1-hour rain",
				hint: "MRMS Q2"
			},
			{
				id: "composite",
				label: "Global",
				hint: "RainViewer"
			}
		]
	},
	{
		id: "site",
		label: "Site sweep",
		products: [
			{
				id: "site-ref",
				label: "Reflectivity",
				hint: "N0Q / TR0"
			},
			{
				id: "site-vel",
				label: "Velocity",
				hint: "N0U / TV0"
			},
			{
				id: "site-srv",
				label: "Storm relative",
				hint: "N0S"
			},
			{
				id: "site-et",
				label: "Echo tops",
				hint: "NET"
			},
			{
				id: "site-vil",
				label: "VIL",
				hint: "N0Z"
			},
			{
				id: "site-hca",
				label: "Hydrometeors",
				hint: "HHC"
			}
		]
	},
	{
		id: "sky",
		label: "Satellite",
		products: [{
			id: "goes-vis",
			label: "Visible",
			hint: "GOES-East"
		}, {
			id: "goes-ir",
			label: "Infrared",
			hint: "GOES-East"
		}]
	}
];
PRODUCT_GROUPS.flatMap((group) => group.products);
var SITE_IDS = new Set(RADAR_SITES.map((site) => site.id));
function radarSite(id) {
	return RADAR_SITES.find((site) => site.id === id) ?? RADAR_SITES[0];
}
function siteSupports(site, product) {
	if (!product.startsWith("site-")) return true;
	if (site.kind === "88d") return true;
	return product === "site-ref" || product === "site-vel";
}
function legendFor(product) {
	if (product === "site-vel" || product === "site-srv") return "vel";
	if (product === "eet" || product === "site-et") return "et";
	if (product === "site-vil") return "vil";
	if (product === "site-hca") return "hca";
	if (product === "n1p") return "precip";
	if (product === "goes-vis" || product === "goes-ir") return "sat";
	return "ref";
}
function frame(partial) {
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
		note: partial.note ?? ""
	};
}
function iemLayer(product, minutesAgo) {
	const base = product === "n0q" ? "nexrad-n0q-900913" : "nexrad-eet-900913";
	if (minutesAgo === 0) return base;
	return `${base}-m${String(minutesAgo).padStart(2, "0")}m`;
}
function iemFrames(product) {
	const now = Math.floor(Date.now() / 1e3);
	return IEM_STEPS.map((minutesAgo) => frame({
		product,
		time: now - minutesAgo * 60,
		tiles: [`${IEM}/${iemLayer(product, minutesAgo)}/{z}/{x}/{y}.png`],
		maxzoom: product === "n0q" ? 12 : 8,
		tileSize: 256,
		provider: "iem",
		label: minutesAgo === 0 ? "Live" : `−${minutesAgo}m`,
		credit: "IEM · NWS NEXRAD"
	}));
}
function singleFrame(product, layer, maxzoom, provider, credit, note = "") {
	return [frame({
		product,
		time: Math.floor(Date.now() / 1e3),
		tiles: [`${IEM}/${layer}/{z}/{x}/{y}.png`],
		maxzoom,
		tileSize: 256,
		provider,
		label: "Latest",
		credit,
		note
	})];
}
function siteFrames(product, siteId) {
	const site = radarSite(SITE_IDS.has(siteId) ? siteId : "KFWS");
	const supported = siteSupports(site, product);
	const moment = supported ? product : "site-ref";
	const code = site.kind === "tdwr" ? moment === "site-vel" ? "TV0" : "TR0" : {
		"site-ref": "N0Q",
		"site-vel": "N0U",
		"site-srv": "N0S",
		"site-et": "NET",
		"site-vil": "N0Z",
		"site-hca": "HHC"
	}[moment] ?? "N0Q";
	const note = supported ? `${site.id} ${code} · ${site.kind === "tdwr" ? "TDWR" : "WSR-88D"}` : `${site.id} has no ${product.replace("site-", "")} sweep. Showing reflectivity.`;
	return singleFrame(product, `ridge::${site.id}-${code}`, 10, "ridge", "IEM RIDGE · NWS", note);
}
function trustedHost(value) {
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
function seedFrames(product, siteId = "KFWS") {
	if (product === "n0q" || product === "eet") return iemFrames(product);
	if (product === "n1p") return singleFrame(product, "q2-n1p-900913", 9, "iem", "IEM · MRMS Q2 1-hour precip");
	if (product === "goes-vis") return singleFrame(product, "goes-east-vis-1km-900913", 8, "goes", "IEM · GOES-East visible");
	if (product === "goes-ir") return singleFrame(product, "goes-east-ir-4km-900913", 6, "goes", "IEM · GOES-East infrared");
	if (product.startsWith("site-")) return siteFrames(product, siteId);
	return [];
}
function rainFrames(host, items, forecast) {
	return items.flatMap((item) => {
		if (typeof item.time !== "number" || typeof item.path !== "string") return [];
		if (!/^\/v2\/radar\/[A-Za-z0-9_-]+$/.test(item.path)) return [];
		return [frame({
			product: "composite",
			time: item.time,
			tiles: [`${host}${item.path}/256/{z}/{x}/{y}/5/1_1.png`],
			maxzoom: 7,
			tileSize: 256,
			provider: "rainviewer",
			label: forecast ? `+${(/* @__PURE__ */ new Date(item.time * 1e3)).toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit"
			})}` : (/* @__PURE__ */ new Date(item.time * 1e3)).toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit"
			}),
			forecast,
			credit: forecast ? "RainViewer nowcast" : "RainViewer composite"
		})];
	});
}
async function fetchRadarFrames(product, siteId = "KFWS", signal) {
	if (product !== "composite") return seedFrames(product, siteId);
	const res = await fetch(RAINVIEWER_DISCOVERY, {
		signal,
		headers: { Accept: "application/json" },
		cache: "no-store"
	});
	if (!res.ok) throw new Error(`RainViewer ${res.status}`);
	const payload = await res.json();
	const host = trustedHost(payload.host);
	if (!host) return [];
	const past = rainFrames(host, payload.radar?.past ?? [], false);
	const nowcast = rainFrames(host, payload.radar?.nowcast ?? [], true);
	return [...past, ...nowcast].sort((a, b) => a.time - b.time);
}
function formatFrameClock(time) {
	return (/* @__PURE__ */ new Date(time * 1e3)).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short"
	});
}
function frameAge(time) {
	const min = Math.round((Date.now() / 1e3 - time) / 60);
	if (min < -1) return `in ${Math.abs(min)} min`;
	if (min < 1) return "just now";
	if (min === 1) return "1 min ago";
	return `${min} min ago`;
}
function circleRing(lng, lat, radiusKm, steps = 72) {
	const latDelta = radiusKm / 110.574;
	const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
	const ring = [];
	for (let i = 0; i <= steps; i += 1) {
		const t = i / steps * Math.PI * 2;
		ring.push([lng + lngDelta * Math.cos(t), lat + latDelta * Math.sin(t)]);
	}
	return ring;
}
function stormsToGeoJSON(storms) {
	return {
		type: "FeatureCollection",
		features: storms.map((s) => ({
			type: "Feature",
			id: s.id,
			properties: {
				id: s.id,
				name: s.name,
				hailIn: s.hailIn,
				windMph: s.windMph,
				severity: s.severity
			},
			geometry: {
				type: "Polygon",
				coordinates: [circleRing(s.lng, s.lat, s.radiusKm)]
			}
		}))
	};
}
function stormCoresToGeoJSON(storms) {
	return {
		type: "FeatureCollection",
		features: storms.map((s) => ({
			type: "Feature",
			id: `${s.id}-core`,
			properties: {
				id: s.id,
				name: s.name
			},
			geometry: {
				type: "Point",
				coordinates: [s.lng, s.lat]
			}
		}))
	};
}
function propertiesToGeoJSON(properties, focusId) {
	return {
		type: "FeatureCollection",
		features: properties.map((p) => ({
			type: "Feature",
			id: p.id,
			properties: {
				id: p.id,
				address: p.address,
				city: p.city,
				dps: p.dps,
				tone: dpsTone(p.dps),
				focused: p.id === focusId,
				estRepair: p.estRepair,
				owner: p.owner
			},
			geometry: {
				type: "Point",
				coordinates: [p.lng, p.lat]
			}
		}))
	};
}
function sitesToGeoJSON() {
	return {
		type: "FeatureCollection",
		features: RADAR_SITES.map((s) => ({
			type: "Feature",
			id: s.id,
			properties: {
				id: s.id,
				name: s.name,
				kind: s.kind
			},
			geometry: {
				type: "Point",
				coordinates: [s.lng, s.lat]
			}
		}))
	};
}
function siteRingsToGeoJSON() {
	return {
		type: "FeatureCollection",
		features: RADAR_SITES.map((s) => ({
			type: "Feature",
			id: `${s.id}-ring`,
			properties: {
				id: s.id,
				name: s.name,
				kind: s.kind
			},
			geometry: {
				type: "LineString",
				coordinates: circleRing(s.lng, s.lat, s.rangeKm)
			}
		}))
	};
}
function usePolled(loader, ms, initial) {
	const [data, setData] = (0, import_react.useState)(initial);
	const [error, setError] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
		let alive = true;
		const run = async (signal) => {
			setStatus((s) => s === "ready" ? s : "loading");
			try {
				const next = await loader(signal);
				if (!alive) return;
				setData(next);
				setError(null);
				setStatus("ready");
			} catch (err) {
				if (!alive || err instanceof DOMException && err.name === "AbortError") return;
				setError(err instanceof Error ? err.message : "Unavailable");
				setStatus("error");
			}
		};
		const ctrl = new AbortController();
		run(ctrl.signal);
		const id = window.setInterval(() => {
			const tick = new AbortController();
			run(tick.signal);
		}, ms);
		return () => {
			alive = false;
			ctrl.abort();
			window.clearInterval(id);
		};
	}, [loader, ms]);
	return {
		data,
		error,
		status
	};
}
function useRadarLoop(product, siteId = "KFWS", loopMs = 700) {
	const [frames, setFrames] = (0, import_react.useState)(() => seedFrames(product, siteId));
	const [index, setIndex] = (0, import_react.useState)(() => Math.max(0, seedFrames(product, siteId).length - 1));
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [status, setStatus] = (0, import_react.useState)("loading");
	(0, import_react.useEffect)(() => {
		const ctrl = new AbortController();
		setStatus("loading");
		fetchRadarFrames(product, siteId, ctrl.signal).then((next) => {
			setFrames(next);
			setIndex(Math.max(0, next.length - 1));
			setStatus(next.length ? "ready" : "error");
		}).catch((err) => {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setStatus("error");
		});
		return () => ctrl.abort();
	}, [product, siteId]);
	(0, import_react.useEffect)(() => {
		if (!playing || frames.length < 2) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const id = window.setInterval(() => {
			setIndex((i) => (i + 1) % frames.length);
		}, loopMs);
		return () => window.clearInterval(id);
	}, [
		playing,
		frames.length,
		loopMs
	]);
	return {
		frames,
		index,
		setIndex,
		playing,
		setPlaying,
		frame: frames[index] ?? null,
		status
	};
}
function useOutlooks(enabled) {
	const [cat, setCat] = (0, import_react.useState)(EMPTY_OUTLOOK);
	const [hail, setHail] = (0, import_react.useState)(EMPTY_OUTLOOK);
	const [status, setStatus] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const ctrl = new AbortController();
		let alive = true;
		Promise.all([fetchSpcOutlook("cat", ctrl.signal), fetchSpcOutlook("hail", ctrl.signal)]).then(([nextCat, nextHail]) => {
			if (!alive) return;
			setCat(nextCat);
			setHail(nextHail);
			setStatus("ready");
		}).catch((err) => {
			if (!alive || err instanceof DOMException && err.name === "AbortError") return;
			setStatus("error");
		});
		return () => {
			alive = false;
			ctrl.abort();
		};
	}, [enabled]);
	return {
		cat,
		hail,
		status
	};
}
function useStationWx() {
	return usePolled(fetchStationWx, 18e4, null);
}
function useNwsAlerts() {
	return usePolled(fetchNwsAlerts, 12e4, []);
}
function useStormReports() {
	return usePolled(fetchStormReports, 18e4, []);
}
var CARTO = [
	"https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
	"https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
	"https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
];
var CARTO_LABELS = ["https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png", "https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png"];
var STREETS = [
	"https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
	"https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
	"https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
];
var SAT = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
function atlasMapStyle() {
	return {
		version: 8,
		name: "atlas-ops",
		glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
		sources: {
			ops: {
				type: "raster",
				tiles: CARTO,
				tileSize: 256,
				maxzoom: 20,
				attribution: "© OpenStreetMap © CARTO"
			},
			sat: {
				type: "raster",
				tiles: [SAT],
				tileSize: 256,
				maxzoom: 19,
				attribution: "Esri · Maxar · Earthstar"
			},
			streets: {
				type: "raster",
				tiles: STREETS,
				tileSize: 256,
				maxzoom: 20,
				attribution: "© OpenStreetMap © CARTO"
			},
			labels: {
				type: "raster",
				tiles: CARTO_LABELS,
				tileSize: 256,
				maxzoom: 20,
				attribution: "© CARTO"
			}
		},
		layers: [
			{
				id: "ops",
				type: "raster",
				source: "ops"
			},
			{
				id: "sat",
				type: "raster",
				source: "sat",
				layout: { visibility: "none" }
			},
			{
				id: "streets",
				type: "raster",
				source: "streets",
				layout: { visibility: "none" }
			},
			{
				id: "labels",
				type: "raster",
				source: "labels",
				layout: { visibility: "none" }
			}
		]
	};
}
var EMPTY = {
	type: "FeatureCollection",
	features: []
};
function OpsMap({ storms = STORMS, properties = PROPERTIES, focusId, onSelect, onInspect, className, basemap = "ops", product = "n0q", siteId = "KFWS", showRadar = true, showAlerts = true, showReports = true, showOutlook = false, showHail = false, showRings = false, showChrome = true, followFocus = false, center, zoom, interactive = true, opacity = .72, loopMs = 700, inspect = null }) {
	const rootRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const onSelectRef = (0, import_react.useRef)(onSelect);
	const onInspectRef = (0, import_react.useRef)(onInspect);
	onSelectRef.current = onSelect;
	onInspectRef.current = onInspect;
	const [ready, setReady] = (0, import_react.useState)(false);
	const { frames, index, setIndex, playing, setPlaying, frame, status } = useRadarLoop(product, siteId, loopMs);
	const alerts = useNwsAlerts();
	const reports = useStormReports();
	const outlooks = useOutlooks(showOutlook || showHail);
	(0, import_react.useEffect)(() => {
		if (!rootRef.current) return;
		let cancelled = false;
		let map;
		let ro;
		import("../_libs/maplibre-gl.mjs").then((n) => n.t).then((mod) => {
			if (cancelled || !rootRef.current) return;
			const gl = mod.default ?? mod;
			gl.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
			map = new gl.Map({
				container: rootRef.current,
				style: atlasMapStyle(),
				center: center ?? [-96.897, 32.776],
				zoom: zoom ?? 9,
				attributionControl: false,
				interactive,
				fadeDuration: 0
			});
			map.addControl(new gl.NavigationControl({
				showCompass: false,
				visualizePitch: false
			}), "bottom-right");
			map.addControl(new gl.AttributionControl({ compact: true }), "bottom-left");
			map.on("load", () => {
				if (!map) return;
				map.addSource("spc-cat", {
					type: "geojson",
					data: EMPTY
				});
				map.addLayer({
					id: "spc-cat",
					type: "fill",
					source: "spc-cat",
					layout: { visibility: "none" },
					paint: {
						"fill-color": [
							"coalesce",
							["get", "fill"],
							"#c1e9c1"
						],
						"fill-opacity": .22,
						"fill-outline-color": [
							"coalesce",
							["get", "stroke"],
							"rgba(236,234,228,0.35)"
						]
					}
				});
				map.addSource("spc-hail", {
					type: "geojson",
					data: EMPTY
				});
				map.addLayer({
					id: "spc-hail",
					type: "fill",
					source: "spc-hail",
					layout: { visibility: "none" },
					paint: {
						"fill-color": [
							"coalesce",
							["get", "fill"],
							"#c4b59a"
						],
						"fill-opacity": .28,
						"fill-outline-color": [
							"coalesce",
							["get", "stroke"],
							"rgba(236,234,228,0.4)"
						]
					}
				});
				map.addSource("radar", {
					type: "raster",
					tiles: ["https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png"],
					tileSize: 256,
					maxzoom: 12,
					attribution: "IEM · NWS · RainViewer · GOES"
				});
				map.addLayer({
					id: "radar",
					type: "raster",
					source: "radar",
					paint: {
						"raster-opacity": .72,
						"raster-fade-duration": 0
					}
				});
				map.addSource("rings", {
					type: "geojson",
					data: siteRingsToGeoJSON()
				});
				map.addLayer({
					id: "rings",
					type: "line",
					source: "rings",
					layout: { visibility: "none" },
					paint: {
						"line-color": "rgba(236,234,228,0.45)",
						"line-width": 1,
						"line-dasharray": [2, 2]
					}
				});
				map.addSource("alerts", {
					type: "geojson",
					data: EMPTY
				});
				map.addLayer({
					id: "alerts-fill",
					type: "fill",
					source: "alerts",
					paint: {
						"fill-color": [
							"match",
							["get", "severity"],
							"Extreme",
							"rgba(193,122,110,0.28)",
							"Severe",
							"rgba(196,181,154,0.22)",
							"rgba(142,140,134,0.14)"
						],
						"fill-outline-color": "rgba(236,234,228,0.28)"
					}
				});
				map.addSource("storms", {
					type: "geojson",
					data: stormsToGeoJSON(storms)
				});
				map.addLayer({
					id: "storms-fill",
					type: "fill",
					source: "storms",
					paint: {
						"fill-color": "rgba(236,234,228,0.06)",
						"fill-outline-color": "rgba(236,234,228,0.22)"
					}
				});
				map.addSource("storm-cores", {
					type: "geojson",
					data: stormCoresToGeoJSON(storms)
				});
				map.addLayer({
					id: "storm-cores",
					type: "circle",
					source: "storm-cores",
					paint: {
						"circle-radius": 3,
						"circle-color": "#eceae4",
						"circle-stroke-width": 1,
						"circle-stroke-color": "#0b0c0e"
					}
				});
				map.addSource("reports", {
					type: "geojson",
					data: EMPTY
				});
				map.addLayer({
					id: "reports",
					type: "circle",
					source: "reports",
					paint: {
						"circle-radius": 4,
						"circle-color": [
							"case",
							[
								"in",
								"HAIL",
								["get", "type"]
							],
							"#c17a6e",
							"#c4b59a"
						],
						"circle-stroke-width": 1,
						"circle-stroke-color": "#0b0c0e"
					}
				});
				map.addSource("properties", {
					type: "geojson",
					data: propertiesToGeoJSON(properties, focusId)
				});
				map.addLayer({
					id: "properties",
					type: "circle",
					source: "properties",
					paint: {
						"circle-radius": [
							"case",
							[
								"boolean",
								["get", "focused"],
								false
							],
							8,
							5
						],
						"circle-color": [
							"match",
							["get", "tone"],
							"bad",
							"#c17a6e",
							"warn",
							"#c4b59a",
							"ok",
							"#8aa58a",
							"#5c5b57"
						],
						"circle-stroke-width": [
							"case",
							[
								"boolean",
								["get", "focused"],
								false
							],
							2,
							1
						],
						"circle-stroke-color": "#eceae4"
					}
				});
				map.addSource("sites", {
					type: "geojson",
					data: sitesToGeoJSON()
				});
				map.addLayer({
					id: "sites",
					type: "circle",
					source: "sites",
					paint: {
						"circle-radius": 4,
						"circle-color": "transparent",
						"circle-stroke-width": 1.5,
						"circle-stroke-color": "#d8d4cc"
					}
				});
				map.addSource("inspect", {
					type: "geojson",
					data: EMPTY
				});
				map.addLayer({
					id: "inspect",
					type: "circle",
					source: "inspect",
					paint: {
						"circle-radius": 7,
						"circle-color": "transparent",
						"circle-stroke-width": 2,
						"circle-stroke-color": "#eceae4"
					}
				});
				map.on("click", "properties", (e) => {
					const id = e.features?.[0]?.properties?.id;
					if (typeof id === "string") onSelectRef.current?.(id);
				});
				map.on("click", (e) => {
					if ((map?.queryRenderedFeatures(e.point, { layers: ["properties"] }) ?? []).length) return;
					onInspectRef.current?.({
						lng: e.lngLat.lng,
						lat: e.lngLat.lat
					});
				});
				map.on("mouseenter", "properties", () => {
					map.getCanvas().style.cursor = "pointer";
				});
				map.on("mouseleave", "properties", () => {
					map.getCanvas().style.cursor = "";
				});
				if (!cancelled) setReady(true);
			});
			mapRef.current = map;
			ro = new ResizeObserver(() => map?.resize());
			ro.observe(rootRef.current);
		});
		return () => {
			cancelled = true;
			setReady(false);
			ro?.disconnect();
			map?.remove();
			mapRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		setVis(map, "ops", basemap === "ops");
		setVis(map, "sat", basemap === "sat");
		setVis(map, "streets", basemap === "streets");
		setVis(map, "labels", basemap === "sat");
	}, [basemap, ready]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map || !frame) return;
		const spec = map.getStyle()?.sources?.radar;
		if (!map.getSource("radar") || spec?.maxzoom !== frame.maxzoom) {
			if (map.getLayer("radar")) map.removeLayer("radar");
			if (map.getSource("radar")) map.removeSource("radar");
			map.addSource("radar", {
				type: "raster",
				tiles: frame.tiles,
				tileSize: frame.tileSize,
				maxzoom: frame.maxzoom,
				attribution: frame.credit
			});
			const before = map.getLayer("rings") ? "rings" : void 0;
			map.addLayer({
				id: "radar",
				type: "raster",
				source: "radar",
				paint: {
					"raster-opacity": showRadar ? opacity : 0,
					"raster-fade-duration": 0
				}
			}, before);
		} else {
			map.getSource("radar")?.setTiles(frame.tiles);
			map.setPaintProperty("radar", "raster-opacity", showRadar ? opacity : 0);
		}
		setVis(map, "radar", showRadar);
	}, [
		frame,
		showRadar,
		ready,
		opacity
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		setOutlook(map, "spc-cat", outlooks.cat, showOutlook);
		setOutlook(map, "spc-hail", outlooks.hail, showHail);
		setVis(map, "rings", showRings);
	}, [
		outlooks.cat,
		outlooks.hail,
		showOutlook,
		showHail,
		showRings,
		ready
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		map.getSource("inspect")?.setData(inspect ? {
			type: "FeatureCollection",
			features: [{
				type: "Feature",
				properties: {},
				geometry: {
					type: "Point",
					coordinates: [inspect.lng, inspect.lat]
				}
			}]
		} : EMPTY);
	}, [inspect, ready]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		map.getSource("storms")?.setData(stormsToGeoJSON(storms));
		map.getSource("storm-cores")?.setData(stormCoresToGeoJSON(storms));
	}, [storms, ready]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		map.getSource("properties")?.setData(propertiesToGeoJSON(properties, focusId));
	}, [
		properties,
		focusId,
		ready
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		map.getSource("alerts")?.setData(alertsToGeoJSON(alerts.data));
		setVis(map, "alerts-fill", showAlerts);
	}, [
		alerts.data,
		showAlerts,
		ready
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map) return;
		map.getSource("reports")?.setData(reportsToGeoJSON(reports.data));
		setVis(map, "reports", showReports);
	}, [
		reports.data,
		showReports,
		ready
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map || !center) return;
		map.easeTo({
			center,
			zoom: zoom ?? map.getZoom(),
			duration: 500
		});
	}, [
		center?.[0],
		center?.[1],
		zoom,
		ready
	]);
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		if (!ready || !map || !followFocus || !focusId) return;
		const hit = properties.find((p) => p.id === focusId);
		if (!hit) return;
		map.easeTo({
			center: [hit.lng, hit.lat],
			zoom: Math.max(map.getZoom(), 11),
			duration: 450
		});
	}, [
		focusId,
		properties,
		followFocus,
		ready
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("atlas-map relative overflow-hidden rounded-lg bg-raised", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: "absolute inset-0"
			}),
			showChrome && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto rounded-md bg-background/80 px-3 py-2 shadow-[var(--shadow-border)] backdrop-blur-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs uppercase tracking-wider text-faint",
						children: [
							frame?.credit ?? "Radar",
							" · ",
							status === "ready" ? frameAge(frame?.time ?? 0) : status
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm tabular-nums",
						children: frame ? `${frame.forecast ? "Forecast " : ""}${formatFrameClock(frame.time)}` : "Waiting on tiles"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex items-center gap-2 rounded-md bg-background/80 px-2 py-1 shadow-[var(--shadow-border)] backdrop-blur-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-10 place-items-center rounded-sm hover:bg-accent",
						onClick: () => setPlaying((v) => !v),
						"aria-label": playing ? "Pause radar" : "Play radar",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-px size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: Math.max(0, frames.length - 1),
						value: index,
						onChange: (e) => {
							setPlaying(false);
							setIndex(Number(e.target.value));
						},
						className: "w-28 accent-primary",
						"aria-label": "Radar time"
					})]
				})]
			}),
			showChrome && frame && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute bottom-8 left-3 z-10 max-w-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					legend: frame.legend,
					note: frame.note
				})
			})
		]
	});
}
function setVis(map, layer, on) {
	if (!map.getLayer(layer)) return;
	map.setLayoutProperty(layer, "visibility", on ? "visible" : "none");
}
function setOutlook(map, layer, data, on) {
	const source = layer === "spc-cat" ? "spc-cat" : "spc-hail";
	map.getSource(source)?.setData(data);
	setVis(map, layer, on && data.features.length > 0);
}
function Legend({ legend, note }) {
	const scale = legend === "vel" ? "radar-scale-vel" : legend === "precip" ? "radar-scale-precip" : "radar-scale";
	const title = legend === "vel" ? "Velocity" : legend === "et" ? "Echo tops" : legend === "vil" ? "VIL" : legend === "hca" ? "Hydrometeor class" : legend === "precip" ? "1-hour rain" : legend === "sat" ? "GOES-East" : "Reflectivity";
	const ends = legend === "vel" ? [
		"−64",
		"0",
		"+64 kt"
	] : legend === "et" ? [
		"10",
		"30",
		"70 kft"
	] : legend === "vil" ? [
		"5",
		"30",
		"70"
	] : legend === "precip" ? [
		"0.01",
		"0.5",
		"2 in"
	] : legend === "hca" ? [
		"rain",
		"graupel",
		"hail"
	] : legend === "sat" ? ["cold", "storm top"] : [
		"20",
		"hail",
		"70 dBZ"
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-background/80 px-3 py-2 shadow-[var(--shadow-border)] backdrop-blur-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs uppercase tracking-wider text-faint",
				children: title
			}),
			legend !== "sat" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn(scale, "mt-1 h-1.5 w-40 rounded-full") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex justify-between gap-3 font-mono text-xs text-faint",
				children: ends.map((label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }, label))
			}),
			note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: note
			})
		]
	});
}
//#endregion
export { siteSupports as a, useStormReports as c, radarSite as i, PRODUCT_GROUPS as n, useNwsAlerts as o, RADAR_SITES as r, useStationWx as s, OpsMap as t };
