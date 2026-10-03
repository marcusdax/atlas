import { i as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { i as cn } from "./_ssr/router-CmP8cOMd.mjs";
import { t as Button } from "./_ssr/button-Bb7DZtqA.mjs";
import { t as Input } from "./_ssr/input-B5z442AI.mjs";
import { c as propertiesForStorm, i as STORMS, r as PROPERTIES } from "./_ssr/data-DyH99hDQ.mjs";
import { t as useAtlas } from "./_ssr/store-ChlvT4jC.mjs";
import { c as isHailish, i as fetchPointBrief, u as searchPlaces } from "./_ssr/weather-CE_Wyfd0.mjs";
import { t as Badge } from "./_ssr/badge-S6QLz03t.mjs";
import { a as siteSupports, c as useStormReports, i as radarSite, n as PRODUCT_GROUPS, o as useNwsAlerts, r as RADAR_SITES, s as useStationWx, t as OpsMap } from "./_ssr/ops-map-ghfTMtEB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_app.radar-D71zcNZB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SPEEDS = [
	{
		ms: 1100,
		label: "Slow"
	},
	{
		ms: 700,
		label: "Loop"
	},
	{
		ms: 350,
		label: "Fast"
	}
];
function RadarPage() {
	const [product, setProduct] = (0, import_react.useState)("n0q");
	const [siteId, setSiteId] = (0, import_react.useState)("KFWS");
	const [basemap, setBasemap] = (0, import_react.useState)("ops");
	const [showRadar, setShowRadar] = (0, import_react.useState)(true);
	const [showAlerts, setShowAlerts] = (0, import_react.useState)(true);
	const [showReports, setShowReports] = (0, import_react.useState)(true);
	const [showOutlook, setShowOutlook] = (0, import_react.useState)(false);
	const [showHail, setShowHail] = (0, import_react.useState)(false);
	const [showRings, setShowRings] = (0, import_react.useState)(true);
	const [opacity, setOpacity] = (0, import_react.useState)(.72);
	const [loopMs, setLoopMs] = (0, import_react.useState)(700);
	const [query, setQuery] = (0, import_react.useState)("");
	const [places, setPlaces] = (0, import_react.useState)([]);
	const [camera, setCamera] = (0, import_react.useState)(null);
	const [brief, setBrief] = (0, import_react.useState)(null);
	const [briefState, setBriefState] = (0, import_react.useState)("idle");
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
	const localReports = (0, import_react.useMemo)(() => reports.data.filter((r) => r.lat > 32.35 && r.lat < 33.15 && r.lng > -97.55 && r.lng < -96.55), [reports.data]);
	(0, import_react.useEffect)(() => {
		if (!mapFocus) return;
		setCamera({
			center: [mapFocus.lng, mapFocus.lat],
			zoom: mapFocus.zoom
		});
	}, [mapFocus]);
	(0, import_react.useEffect)(() => {
		if (siteSupports(site, product)) return;
		setProduct("site-ref");
	}, [site, product]);
	(0, import_react.useEffect)(() => {
		const q = query.trim();
		if (q.length < 3) {
			setPlaces([]);
			return;
		}
		const ctrl = new AbortController();
		const id = window.setTimeout(() => {
			searchPlaces(q, ctrl.signal).then(setPlaces).catch(() => setPlaces([]));
		}, 280);
		return () => {
			ctrl.abort();
			window.clearTimeout(id);
		};
	}, [query]);
	function inspect(point) {
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
			cape: null
		});
		fetchPointBrief(point.lat, point.lng).then((next) => {
			setBrief(next);
			setBriefState("idle");
		}).catch(() => setBriefState("error"));
	}
	function flyToSite(id) {
		const next = radarSite(id);
		setSiteId(id);
		setCamera({
			center: [next.lng, next.lat],
			zoom: next.kind === "tdwr" ? 10 : 8
		});
		if (!product.startsWith("site-") && product !== "goes-vis" && product !== "goes-ir") setProduct("site-ref");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "atlas-map-stage -mx-4 -my-6 flex flex-col lg:flex-row sm:-mx-6 lg:-mx-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative min-h-96 flex-1 lg:min-h-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpsMap, {
				className: "absolute inset-0 h-full min-h-96 rounded-none",
				storms: STORMS,
				properties: PROPERTIES,
				focusId: selectedPropertyId,
				onSelect: selectProperty,
				onInspect: inspect,
				product,
				siteId,
				basemap,
				showRadar,
				showAlerts,
				showReports,
				showOutlook,
				showHail,
				showRings,
				opacity,
				loopMs,
				inspect: brief,
				center: camera?.center,
				zoom: camera?.zoom
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-border bg-background p-4 lg:w-80 lg:border-l lg:border-t-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs uppercase tracking-wider text-faint",
						children: "Live radar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl tracking-tight",
						children: "The sweep, not a sketch."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "NEXRAD mosaic and RIDGE site moments from IEM, GOES-East, MRMS rain, RainViewer composite, SPC day-1 polygons, NWS alerts."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "City, town, or street address",
						"aria-label": "Search the map"
					}), places.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "absolute z-20 mt-1 w-full overflow-hidden rounded-md bg-popover p-1 shadow-[var(--shadow-border)]",
						children: places.map((place) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "flex min-h-11 w-full items-center rounded-sm px-3 text-left text-sm hover:bg-accent",
							onClick: () => {
								setQuery("");
								setPlaces([]);
								setCamera({
									center: [place.lng, place.lat],
									zoom: 12
								});
								inspect({
									lng: place.lng,
									lat: place.lat
								});
							},
							children: place.label
						}) }, place.id))
					})]
				}),
				wx.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-card p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs uppercase tracking-wider text-faint",
							children: [wx.data.station, " · Fort Worth"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-display text-2xl",
							children: [
								wx.data.tempF ?? "—",
								"° · ",
								wx.data.text
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Wind ",
								wx.data.windMph ?? "—",
								" mph",
								wx.data.gustMph ? ` gust ${wx.data.gustMph}` : "",
								wx.data.humidity != null ? ` · ${wx.data.humidity}% rh` : ""
							]
						})
					]
				}),
				brief && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-card p-4 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs uppercase tracking-wider text-faint",
							children: [
								brief.office,
								" gridpoint",
								briefState === "loading" ? " · reading" : "",
								briefState === "error" ? " · quiet" : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-medium",
							children: brief.place
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-2xl",
							children: [
								brief.tempF ?? "—",
								"° · ",
								brief.forecast
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"Wind ",
								brief.wind,
								brief.gustMph != null ? ` · gust ${brief.gustMph} mph` : "",
								brief.precipIn != null ? ` · ${brief.precipIn}" next 6h` : "",
								brief.cape != null ? ` · CAPE ${brief.cape}` : ""
							]
						})
					]
				}),
				PRODUCT_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 font-mono text-xs uppercase tracking-wider text-faint",
					children: group.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-1",
					children: group.products.map((item) => {
						const disabled = item.id.startsWith("site-") && !siteSupports(site, item.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled,
							onClick: () => setProduct(item.id),
							className: cn("min-h-11 rounded-md px-2 text-left text-xs", product === item.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground", disabled && "opacity-40"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-medium",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block opacity-70",
								children: item.hint
							})]
						}, item.id);
					})
				})] }, group.id)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 font-mono text-xs uppercase tracking-wider text-faint",
					children: ["Radar site · ", site.kind === "tdwr" ? "TDWR" : "WSR-88D"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-x-auto pb-1",
					children: RADAR_SITES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => flyToSite(item.id),
						className: cn("min-h-11 shrink-0 rounded-md px-3 text-left", item.id === site.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-mono text-xs",
							children: item.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs",
							children: item.name
						})]
					}, item.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						[
							["ops", "Ops"],
							["sat", "Satellite"],
							["streets", "Streets"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: basemap === id,
							onPressed: () => setBasemap(id),
							children: label
						}, id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: showRadar,
							onPressed: () => setShowRadar((v) => !v),
							children: "Radar"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: showAlerts,
							onPressed: () => setShowAlerts((v) => !v),
							children: "Alerts"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: showReports,
							onPressed: () => setShowReports((v) => !v),
							children: "LSR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: showOutlook,
							onPressed: () => setShowOutlook((v) => !v),
							children: "SPC"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: showHail,
							onPressed: () => setShowHail((v) => !v),
							children: "Hail risk"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: showRings,
							onPressed: () => setShowRings((v) => !v),
							children: "Range rings"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block font-mono text-xs uppercase tracking-wider text-faint",
							children: "Opacity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: .25,
							max: 1,
							step: .05,
							value: opacity,
							onChange: (e) => setOpacity(Number(e.target.value)),
							className: "w-full accent-primary",
							"aria-label": "Radar opacity"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 font-mono text-xs uppercase tracking-wider text-faint",
						children: "Speed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-1",
						children: SPEEDS.map((speed) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setLoopMs(speed.ms),
							className: cn("min-h-11 rounded-md text-xs", loopMs === speed.ms ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
							children: speed.label
						}, speed.ms))
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: STORMS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => selectStorm(s.id),
						className: cn("rounded-lg p-3 text-left shadow-[var(--shadow-border)]", s.id === storm.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs opacity-80",
							children: [
								s.hailIn,
								"\" hail · ",
								s.windMph,
								" mph"
							]
						})]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 font-mono text-xs uppercase tracking-wider text-faint",
					children: ["NWS Texas · ", alerts.data.length]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "flex flex-col gap-2",
					children: [alerts.data.slice(0, 4).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md bg-card p-3 text-sm shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: a.event
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: a.area.split(";")[0]
						})]
					}, a.id)), alerts.status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted-foreground",
						children: "Alerts feed quiet."
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 font-mono text-xs uppercase tracking-wider text-faint",
					children: ["DFW reports · ", localReports.length]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "flex flex-col gap-2",
					children: [localReports.slice(0, 5).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block",
							children: r.city || r.type
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted-foreground",
							children: r.type
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: isHailish(r.type) ? "bad" : "warn",
							children: r.magnitude || "—"
						})]
					}, r.id)), localReports.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted-foreground",
						children: "No hail or wind LSR in the metro."
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Pictures come from public tiles. Level II gate decode, the thing OpenRadar and Py-ART do on a workstation, is not re-run in the browser. The moments, rings, and outlook colours follow those desks."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/recon",
						children: [
							"Score ",
							propertiesForStorm(storm.id).length,
							" roofs in ",
							storm.region
						]
					})
				})
			]
		})]
	});
}
function Toggle({ pressed, onPressed, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick: onPressed,
		className: cn("min-h-11 rounded-md px-3 text-sm", pressed ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
		children
	});
}
//#endregion
export { RadarPage as component };
