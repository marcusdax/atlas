//#region node_modules/.nitro/vite/services/ssr/assets/weather-CE_Wyfd0.js
function cToF(v) {
	return v == null ? null : Math.round(v * 9 / 5 + 32);
}
function toMph(value, unit) {
	if (value == null) return null;
	if (unit?.includes("m_s")) return Math.round(value * 2.23694);
	if (unit?.includes("km_h")) return Math.round(value * .621371);
	return Math.round(value);
}
var NWS_HEADERS = {
	Accept: "application/geo+json",
	"User-Agent": "Atlas Storm OS"
};
async function fetchStationWx(signal) {
	const res = await fetch("https://api.weather.gov/stations/KFWS/observations/latest", {
		signal,
		headers: NWS_HEADERS
	});
	if (!res.ok) throw new Error(`NWS obs ${res.status}`);
	const p = (await res.json()).properties ?? {};
	return {
		text: p.textDescription || "Observation",
		tempF: cToF(p.temperature?.value),
		windMph: toMph(p.windSpeed?.value, p.windSpeed?.unitCode),
		gustMph: toMph(p.windGust?.value, p.windGust?.unitCode),
		humidity: p.relativeHumidity?.value == null ? null : Math.round(p.relativeHumidity.value),
		timestamp: p.timestamp ?? null,
		station: "KFWS"
	};
}
async function fetchNwsAlerts(signal) {
	const res = await fetch("https://api.weather.gov/alerts/active?area=TX", {
		signal,
		headers: NWS_HEADERS
	});
	if (!res.ok) throw new Error(`NWS alerts ${res.status}`);
	return ((await res.json()).features ?? []).map((f, i) => ({
		id: String(f.properties?.id ?? f.id ?? i),
		event: f.properties?.event ?? "Alert",
		headline: f.properties?.headline ?? "",
		severity: f.properties?.severity ?? "Unknown",
		area: f.properties?.areaDesc ?? "",
		ends: f.properties?.ends ?? null,
		geometry: f.geometry ?? null
	}));
}
async function fetchStormReports(signal) {
	const res = await fetch("https://mesonet.agron.iastate.edu/geojson/lsr.geojson?hours=24", {
		signal,
		headers: { Accept: "application/json" }
	});
	if (!res.ok) throw new Error(`IEM LSR ${res.status}`);
	const json = await res.json();
	const wanted = /HAIL|TSTM|TORN|WIND DMG|WIND GST/;
	return (json.features ?? []).map((f, i) => {
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
			lat: typeof lat === "number" ? lat : 0
		};
	}).filter((r) => wanted.test(r.type) && r.lng && r.lat);
}
function alertsToGeoJSON(alerts) {
	return {
		type: "FeatureCollection",
		features: alerts.filter((a) => a.geometry).map((a) => ({
			type: "Feature",
			id: a.id,
			properties: {
				id: a.id,
				event: a.event,
				severity: a.severity
			},
			geometry: a.geometry
		}))
	};
}
function reportsToGeoJSON(reports) {
	return {
		type: "FeatureCollection",
		features: reports.map((r) => ({
			type: "Feature",
			id: r.id,
			properties: {
				id: r.id,
				type: r.type,
				city: r.city,
				magnitude: r.magnitude
			},
			geometry: {
				type: "Point",
				coordinates: [r.lng, r.lat]
			}
		}))
	};
}
function isHailish(type) {
	return /HAIL/.test(type);
}
var EMPTY_OUTLOOK = {
	type: "FeatureCollection",
	features: []
};
var SPC_URL = {
	cat: "https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson",
	hail: "https://www.spc.noaa.gov/products/outlook/day1otlk_hail.nolyr.geojson"
};
function hexColor(value, fallback) {
	return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;
}
async function fetchSpcOutlook(kind, signal) {
	const res = await fetch(SPC_URL[kind], {
		signal,
		headers: { Accept: "application/geo+json" }
	});
	if (!res.ok) throw new Error(`SPC ${kind} ${res.status}`);
	return {
		type: "FeatureCollection",
		features: ((await res.json()).features ?? []).flatMap((feature) => {
			const fill = feature.properties?.fill;
			if (!feature.geometry || typeof fill !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(fill)) return [];
			return [{
				type: "Feature",
				properties: {
					label: feature.properties?.LABEL ?? "Outlook",
					label2: feature.properties?.LABEL2 ?? "",
					fill,
					stroke: hexColor(feature.properties?.stroke, fill)
				},
				geometry: feature.geometry
			}];
		})
	};
}
async function searchPlaces(query, signal) {
	const q = query.trim();
	if (q.length < 3) return [];
	const [places, streets] = await Promise.all([searchOpenMeteo(q, signal).catch(() => []), /\d/.test(q) ? searchCensus(q, signal).catch(() => []) : Promise.resolve([])]);
	const seen = /* @__PURE__ */ new Set();
	const hits = [];
	for (const hit of [...streets, ...places]) {
		const key = `${hit.lat.toFixed(2)},${hit.lng.toFixed(2)}`;
		if (seen.has(key)) continue;
		seen.add(key);
		hits.push(hit);
	}
	return hits.slice(0, 6);
}
async function searchOpenMeteo(q, signal) {
	const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
	url.searchParams.set("name", q);
	url.searchParams.set("count", "6");
	url.searchParams.set("language", "en");
	url.searchParams.set("format", "json");
	const res = await fetch(url, {
		signal,
		headers: { Accept: "application/json" }
	});
	if (!res.ok) throw new Error(`Geocoder ${res.status}`);
	return ((await res.json()).results ?? []).flatMap((row) => {
		if (typeof row.latitude !== "number" || typeof row.longitude !== "number" || !row.name) return [];
		const where = [row.name, row.admin1].filter(Boolean).join(", ");
		return [{
			id: `om-${row.id ?? where}`,
			label: where,
			lng: row.longitude,
			lat: row.latitude,
			us: row.country_code === "US"
		}];
	}).sort((a, b) => Number(b.us) - Number(a.us)).map(({ us: _us, ...hit }) => hit);
}
async function searchCensus(q, signal) {
	const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
	url.searchParams.set("address", q);
	url.searchParams.set("benchmark", "Public_AR_Current");
	url.searchParams.set("format", "json");
	const res = await fetch(url, {
		signal,
		headers: { Accept: "application/json" }
	});
	if (!res.ok) throw new Error(`Census ${res.status}`);
	return ((await res.json()).result?.addressMatches ?? []).flatMap((row, index) => {
		const lng = row.coordinates?.x;
		const lat = row.coordinates?.y;
		if (typeof lng !== "number" || typeof lat !== "number" || !row.matchedAddress) return [];
		return [{
			id: `census-${index}`,
			label: row.matchedAddress,
			lng,
			lat
		}];
	});
}
function trustedForecast(value) {
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
async function fetchPointBrief(lat, lng, signal) {
	const pointUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`;
	const meteoUrl = new URL("https://api.open-meteo.com/v1/forecast");
	meteoUrl.searchParams.set("latitude", lat.toFixed(4));
	meteoUrl.searchParams.set("longitude", lng.toFixed(4));
	meteoUrl.searchParams.set("hourly", "precipitation,wind_gusts_10m,cape");
	meteoUrl.searchParams.set("forecast_days", "1");
	meteoUrl.searchParams.set("temperature_unit", "fahrenheit");
	meteoUrl.searchParams.set("wind_speed_unit", "mph");
	meteoUrl.searchParams.set("precipitation_unit", "inch");
	const [pointRes, meteoRes] = await Promise.all([fetch(pointUrl, {
		signal,
		headers: NWS_HEADERS
	}), fetch(meteoUrl, {
		signal,
		headers: { Accept: "application/json" }
	})]);
	if (!pointRes.ok) throw new Error(`NWS point ${pointRes.status}`);
	const point = await pointRes.json();
	const city = point.properties?.relativeLocation?.properties?.city;
	const state = point.properties?.relativeLocation?.properties?.state;
	const forecastUrl = trustedForecast(point.properties?.forecast);
	let tempF = null;
	let wind = "—";
	let forecast = "Gridpoint forecast quiet";
	if (forecastUrl) {
		const forecastRes = await fetch(forecastUrl, {
			signal,
			headers: NWS_HEADERS
		});
		if (forecastRes.ok) {
			const period = (await forecastRes.json()).properties?.periods?.[0];
			if (period) {
				tempF = typeof period.temperature === "number" ? period.temperature : null;
				wind = period.windSpeed ?? "—";
				forecast = period.shortForecast ?? forecast;
			}
		}
	}
	let gustMph = null;
	let precipIn = null;
	let cape = null;
	if (meteoRes.ok) {
		const meteo = await meteoRes.json();
		const rain = (meteo.hourly?.precipitation ?? []).slice(0, 6).filter((n) => n != null);
		const gusts = (meteo.hourly?.wind_gusts_10m ?? []).slice(0, 6).filter((n) => n != null);
		const capes = (meteo.hourly?.cape ?? []).slice(0, 6).filter((n) => n != null);
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
		cape
	};
}
//#endregion
export { fetchSpcOutlook as a, isHailish as c, fetchPointBrief as i, reportsToGeoJSON as l, alertsToGeoJSON as n, fetchStationWx as o, fetchNwsAlerts as r, fetchStormReports as s, EMPTY_OUTLOOK as t, searchPlaces as u };
