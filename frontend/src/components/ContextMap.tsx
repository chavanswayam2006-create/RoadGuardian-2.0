import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import type { Garage, RoadContext } from '../types';

interface ContextMapProps {
  roadContext: RoadContext | null;
  garages: Garage[];
}

export const ContextMap: React.FC<ContextMapProps> = ({ roadContext, garages }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const garageMarkersRef = useRef<L.LayerGroup | null>(null);

  // Munich benchmark coordinates from backend
  const defaultLat = roadContext?.lat || 48.137154;
  const defaultLon = roadContext?.lon || 11.576124;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLon],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark CartoDB dark matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Subtle vehicle reticle icon
    const vehicleIcon = L.divIcon({
      className: 'vehicle-reticle',
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: rgba(141, 184, 255, 0.15);
          border: 1.5px solid #8DB8FF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(141, 184, 255, 0.4);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: #8DB8FF;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    const marker = L.marker([defaultLat, defaultLon], { icon: vehicleIcon }).addTo(map);
    vehicleMarkerRef.current = marker;

    const garageGroup = L.layerGroup().addTo(map);
    garageMarkersRef.current = garageGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [defaultLat, defaultLon]);

  // Update garage markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !garageMarkersRef.current) return;

    garageMarkersRef.current.clearLayers();

    garages.forEach((garage) => {
      const lat = typeof garage.lat === 'number' ? garage.lat : (garage as any)?.coordinates?.latitude;
      const lon = typeof garage.lon === 'number' ? garage.lon : (garage as any)?.coordinates?.longitude;
      if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
        return;
      }

      const serviceIcon = L.divIcon({
        className: 'garage-marker',
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: #0B1B2A;
            border: 1px solid rgba(141, 184, 255, 0.4);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
            color: #8DB8FF;
            font-size: 11px;
            font-family: monospace;
            font-weight: bold;
          ">
            W
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      try {
        const marker = L.marker([lat, lon], { icon: serviceIcon });
        marker.bindPopup(`
          <div style="padding: 6px; min-width: 170px;">
            <div style="font-weight: 700; font-size: 12px; color: #E6F0FA; margin-bottom: 2px;">
              ${garage.name || 'Verified Service Center'}
            </div>
            <div style="font-size: 10px; color: #9BAEC0; font-family: monospace; margin-bottom: 4px;">
              ${garage.distance_meters ?? 500}m away • Rating: ${garage.rating ?? 4.8}★
            </div>
            <div style="font-size: 10px; color: #8DB8FF; font-family: monospace;">
              TEL: ${garage.phone || 'N/A'}
            </div>
          </div>
        `);
        marker.addTo(garageMarkersRef.current!);
      } catch (err) {
        console.warn('Failed to add garage marker:', err);
      }
    });
  }, [garages]);

  // Smooth vehicle simulation position update
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (!vehicleMarkerRef.current || !mapInstanceRef.current) return;
      step = (step + 1) % 360;
      const angle = (step * Math.PI) / 180;
      const deltaLat = Math.sin(angle) * 0.0004;
      const deltaLon = Math.cos(angle) * 0.0006;

      vehicleMarkerRef.current.setLatLng([defaultLat + deltaLat, defaultLon + deltaLon]);
    }, 1200);

    return () => clearInterval(interval);
  }, [defaultLat, defaultLon]);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-bg overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />

      {/* Floating Tactical Road Pill Overlay */}
      <div className="absolute top-3 left-3 z-[1000] p-2 rounded bg-surface/90 border border-border backdrop-blur-md shadow-lg max-w-xs text-xs font-mono">
        <div className="flex items-center gap-1.5 text-text-primary font-bold">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <span className="truncate">{roadContext?.road_name || 'Leopoldstraße / A99'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
          <span>LIMIT: <strong className="text-accent">{roadContext?.active_speed_limit_kmh || 50} KM/H</strong></span>
          <span>•</span>
          <span>HAZARDS: <strong className="text-success">NONE</strong></span>
        </div>
      </div>
    </div>
  );
};
