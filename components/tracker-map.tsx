"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";

export type TrackerPoint = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  seen: string;
  accuracy?: number;
  live?: boolean;
};

export default function TrackerMap({ points }: { points: TrackerPoint[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !hostRef.current || mapRef.current) return;
      const map = L.map(hostRef.current, { zoomControl: true, attributionControl: true }).setView([8.6, 1.08], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 100);
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) {
      const retry = window.setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 250);
      return () => window.clearTimeout(retry);
    }
    void import("leaflet").then((L) => {
      const layer = layerRef.current;
      const map = mapRef.current;
      if (!layer || !map) return;
      layer.clearLayers();
      const bounds: [number, number][] = [];
      points.forEach((point) => {
        bounds.push([point.lat, point.lng]);
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: point.live ? 12 : 10,
          color: point.live ? "#111510" : "#6b735e",
          weight: 3,
          fillColor: point.live ? "#ffca05" : "#ffffff",
          fillOpacity: 1,
        }).addTo(layer);
        const popup = document.createElement("div");
        const name = document.createElement("strong"); name.textContent = point.name; popup.append(name);
        for (const text of [point.city, `Position GPS · ${point.seen}`, ...(point.accuracy ? [`Précision ±${Math.round(point.accuracy)} m`] : [])]) {
          popup.append(document.createElement("br"), document.createTextNode(text));
        }
        marker.bindPopup(popup);
        marker.bindTooltip(point.name, { permanent: true, direction: "top", offset: [0, -12], className: "ega-map-label" });
        if (point.live && point.accuracy) L.circle([point.lat, point.lng], { radius: point.accuracy, color: "#ffca05", weight: 1, fillColor: "#ffca05", fillOpacity: .08 }).addTo(layer);
      });
      if (bounds.length === 1) map.setView(bounds[0], 14);
      else if (bounds.length > 1) map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
    });
  }, [points, ready]);

  return <div ref={hostRef} className="leaflet-host" aria-label="Carte interactive des positions partagées au Togo" />;
}
