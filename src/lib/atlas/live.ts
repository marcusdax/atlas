import { useEffect, useState } from "react";
import { fetchRadarFrames, seedFrames, type RadarFrame, type RadarProduct } from "./radar";
import {
  EMPTY_OUTLOOK,
  fetchNwsAlerts,
  fetchSpcOutlook,
  fetchStationWx,
  fetchStormReports,
  type NwsAlert,
  type OutlookCollection,
  type StationWx,
  type StormReport,
} from "./weather";

function usePolled<T>(loader: (signal: AbortSignal) => Promise<T>, ms: number, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let alive = true;
    const run = async (signal: AbortSignal) => {
      setStatus((s) => (s === "ready" ? s : "loading"));
      try {
        const next = await loader(signal);
        if (!alive) return;
        setData(next);
        setError(null);
        setStatus("ready");
      } catch (err) {
        if (!alive || (err instanceof DOMException && err.name === "AbortError")) return;
        setError(err instanceof Error ? err.message : "Unavailable");
        setStatus("error");
      }
    };

    const ctrl = new AbortController();
    void run(ctrl.signal);
    const id = window.setInterval(() => {
      const tick = new AbortController();
      void run(tick.signal);
    }, ms);
    return () => {
      alive = false;
      ctrl.abort();
      window.clearInterval(id);
    };
  }, [loader, ms]);

  return { data, error, status };
}

export function useRadarLoop(product: RadarProduct, siteId = "KFWS", loopMs = 700) {
  const [frames, setFrames] = useState<RadarFrame[]>(() => seedFrames(product, siteId));
  const [index, setIndex] = useState(() => Math.max(0, seedFrames(product, siteId).length - 1));
  const [playing, setPlaying] = useState(true);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const ctrl = new AbortController();
    setStatus("loading");
    void fetchRadarFrames(product, siteId, ctrl.signal)
      .then((next) => {
        setFrames(next);
        setIndex(Math.max(0, next.length - 1));
        setStatus(next.length ? "ready" : "error");
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
      });
    return () => ctrl.abort();
  }, [product, siteId]);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, loopMs);
    return () => window.clearInterval(id);
  }, [playing, frames.length, loopMs]);

  const frame = frames[index] ?? null;
  return { frames, index, setIndex, playing, setPlaying, frame, status };
}

export function useOutlooks(enabled: boolean) {
  const [cat, setCat] = useState<OutlookCollection>(EMPTY_OUTLOOK);
  const [hail, setHail] = useState<OutlookCollection>(EMPTY_OUTLOOK);
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    let alive = true;
    void Promise.all([fetchSpcOutlook("cat", ctrl.signal), fetchSpcOutlook("hail", ctrl.signal)])
      .then(([nextCat, nextHail]) => {
        if (!alive) return;
        setCat(nextCat);
        setHail(nextHail);
        setStatus("ready");
      })
      .catch((err) => {
        if (!alive || (err instanceof DOMException && err.name === "AbortError")) return;
        setStatus("error");
      });
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [enabled]);

  return { cat, hail, status };
}

export function useStationWx() {
  return usePolled(fetchStationWx, 180_000, null as StationWx | null);
}

export function useNwsAlerts() {
  return usePolled(fetchNwsAlerts, 120_000, [] as NwsAlert[]);
}

export function useStormReports() {
  return usePolled(fetchStormReports, 180_000, [] as StormReport[]);
}
