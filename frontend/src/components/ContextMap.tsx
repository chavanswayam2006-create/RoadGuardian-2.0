import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Wrench } from 'lucide-react';
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

  // Default coordinate (Munich benchmark coordinates from backend)
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

    // Dark OpenStreetMap CartoDB dark matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom Vehicle Icon
    const vehicleIcon = L.divIcon({
      className: 'vehicle-reticle',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: rgba(6, 182, 212, 0.2);
          border: 2px solid #06B6D4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #06B6D4;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([defaultLat, defaultLon], { icon: vehicleIcon }).addTo(map);
    vehicleMarkerRef.current = marker;

    // Layer group for garage markers
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

      const wrenchIcon = L.divIcon({
        className: 'garage-marker',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: rgba(15, 23, 42, 0.95);
            border: 1.5px solid #F59E0B;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
            color: #F59E0B;
            font-size: 14px;
          ">
            🔧
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      try {
        const marker = L.marker([lat, lon], { icon: wrenchIcon });
        marker.bindPopup(`
          <div style="font-family: var(--font-sans); padding: 4px; min-width: 160px;">
            <div style="font-weight: bold; font-size: 13px; color: #F8FAFC; margin-bottom: 2px;">
              ${garage.name || 'Auto Service'}
            </div>
            <div style="font-size: 11px; color: #94A3B8; font-family: monospace; margin-bottom: 4px;">
              ${garage.distance_meters ?? 500}m away • Rating: ${garage.rating ?? 4.8}★
            </div>
            <div style="font-size: 11px; color: #06B6D4; font-family: monospace;">
              📞 ${garage.phone || 'N/A'}
            </div>
          </div>
        `);
        marker.addTo(garageMarkersRef.current!);
      } catch (err) {
        console.warn('Failed to add garage marker:', err);
      }
    });
  }, [garages]);

  // Subtle vehicle trajectory simulation
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (!vehicleMarkerRef.current || !mapInstanceRef.current) return;
      step = (step + 1) % 360;
      const angle = (step * Math.PI) / 180;
      // Slight smooth wobble along the road
      const deltaLat = Math.sin(angle) * 0.0006;
      const deltaLon = Math.cos(angle) * 0.0008;

      const newLat = defaultLat + deltaLat;
      const newLon = defaultLon + deltaLon;
      vehicleMarkerRef.current.setLatLng([newLat, newLon]);
    }, 1000);

    return () => clearInterval(interval);
  }, [defaultLat, defaultLon]);

  return (
    <div className="hud-card hud-brackets flex flex-col h-full bg-slate-900/90 backdrop-blur-md">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <Navigation className="w-4 h-4" />
          <span className="font-bold tracking-wider uppercase">GEOSPATIAL & ROAD HUD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
            {roadContext?.data_source || 'DEMO_DATA'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">OSM DARK TILES</span>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative flex-1 min-h-[280px] bg-slate-950 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '280px' }} />

        {/* Floating Road Context Card Overlay */}
        <div className="absolute top-3 left-3 z-[1000] p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/90 backdrop-blur-md shadow-xl max-w-xs text-xs">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-100 font-mono">
              {roadContext?.road_name || 'Leopoldstraße / A99'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] text-slate-400">
            <div>
              TYPE: <span className="text-slate-200">{roadContext?.road_type || 'PRIMARY'}</span>
            </div>
            <div>
              LIMIT: <span className="text-cyan-300 font-bold">{roadContext?.active_speed_limit_kmh || 50} KM/H</span>
            </div>
            <div>
              WEATHER: <span className="text-slate-200">{roadContext?.weather_condition || 'CLEAR'}</span>
            </div>
            <div>
              HAZARD: <span className={roadContext?.construction_warning ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {roadContext?.construction_warning ? 'ROADWORK' : 'NONE'}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Garage Quick List Accordion Overlay */}
        <div className="absolute bottom-3 right-3 z-[1000] p-2 rounded-lg bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-300 hidden sm:block">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>NEARBY REPAIR CENTERS ({garages.length})</span>
          </div>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
            {garages.slice(0, 3).map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 text-slate-400 hover:text-slate-200">
                <span className="truncate max-w-[120px]">{g.name}</span>
                <span className="text-cyan-400 shrink-0">{g.distance_meters}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
