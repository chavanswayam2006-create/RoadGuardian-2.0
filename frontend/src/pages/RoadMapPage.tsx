import React, { useState } from 'react';
import { Compass, PhoneCall, Layers } from 'lucide-react';
import { ContextMap } from '../components/ContextMap';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { RoadContext, Garage } from '../types';

interface RoadMapPageProps {
  roadContext: RoadContext | null;
  garages: Garage[];
  speedLimitKmh: number;
}

export const RoadMapPage: React.FC<RoadMapPageProps> = ({
  roadContext,
  garages,
  speedLimitKmh,
}) => {
  // Map filter layers
  const [layers, setLayers] = useState({
    traffic: true,
    signs: true,
    signals: true,
    construction: false,
    speed: true,
    garages: true,
  });

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col lg:flex-row select-none">
      {/* Primary Map Visual Area (Center & Left) */}
      <div className="relative flex-1 h-full min-h-[350px]">
        <ErrorBoundary fallbackTitle="MAP MODULE RECOVERY">
          <ContextMap roadContext={roadContext} garages={layers.garages ? garages : []} />
        </ErrorBoundary>

        {/* Floating Map Controls Bar (TRAFFIC, SIGNS, SIGNALS, CONSTRUCTION, SPEED, GARAGES) */}
        <div className="absolute top-3 right-3 lg:right-auto lg:left-3 z-[1000] flex items-center gap-1.5 flex-wrap bg-surface/90 p-1.5 rounded-md border border-border backdrop-blur-md shadow-lg font-mono text-[11px]">
          <span className="text-text-muted px-1.5 flex items-center gap-1 uppercase font-bold text-[10px]">
            <Layers className="w-3.5 h-3.5 text-accent" />
            LAYERS:
          </span>

          <button
            onClick={() => toggleLayer('traffic')}
            className={`px-2 py-0.5 rounded transition-colors ${
              layers.traffic ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-muted'
            }`}
          >
            TRAFFIC
          </button>
          <button
            onClick={() => toggleLayer('signs')}
            className={`px-2 py-0.5 rounded transition-colors ${
              layers.signs ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-muted'
            }`}
          >
            SIGNS
          </button>
          <button
            onClick={() => toggleLayer('signals')}
            className={`px-2 py-0.5 rounded transition-colors ${
              layers.signals ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-muted'
            }`}
          >
            SIGNALS
          </button>
          <button
            onClick={() => toggleLayer('construction')}
            className={`px-2 py-0.5 rounded transition-colors ${
              layers.construction ? 'bg-warning text-bg font-bold' : 'surface-elevated text-text-muted'
            }`}
          >
            CONSTRUCTION
          </button>
          <button
            onClick={() => toggleLayer('speed')}
            className={`px-2 py-0.5 rounded transition-colors ${
              layers.speed ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-muted'
            }`}
          >
            SPEED
          </button>
          <button
            onClick={() => toggleLayer('garages')}
            className={`px-2 py-0.5 rounded transition-colors ${
              layers.garages ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-muted'
            }`}
          >
            GARAGES
          </button>
        </div>

        {/* Floating GNSS RTK Lock Indicator on Bottom-Left */}
        <div className="absolute bottom-3 left-3 z-[1000] font-mono text-[10px] bg-surface/90 px-2 py-1 rounded border border-border backdrop-blur-md text-text-muted hidden sm:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success status-pulse" />
          <span>GNSS RTK LOCK (L1+L5)</span>
          <span>•</span>
          <span>LAT: {roadContext?.lat.toFixed(4) || '48.1371'}°</span>
          <span>LON: {roadContext?.lon.toFixed(4) || '11.5761'}°</span>
        </div>
      </div>

      {/* Right-Side Road Context Drawer (320px width) */}
      <div className="w-full lg:w-[320px] bg-surface border-t lg:border-t-0 lg:border-l border-border flex flex-col shrink-0 h-auto lg:h-full z-10 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
            <Compass className="w-4 h-4 text-accent" />
            <span className="font-bold tracking-wider uppercase text-text-primary">
              ROAD CONTEXT
            </span>
          </div>
        </div>

        {/* Current Road Details */}
        <div className="p-4 space-y-4 font-mono text-xs flex-1">
          {/* CURRENT ROAD */}
          <div className="surface-inset p-3">
            <span className="telemetry-label text-[9px]">CURRENT ROAD</span>
            <div className="font-headline font-bold text-sm text-text-primary mt-0.5 truncate">
              {roadContext?.road_name || 'Leopoldstraße / A99 Corridor'}
            </div>
            <span className="text-[10px] text-text-muted mt-0.5 block uppercase">
              TYPE: {roadContext?.road_type || 'PRIMARY ARTERIAL'}
            </span>
          </div>

          {/* Speed Limit & Traffic */}
          <div className="grid grid-cols-2 gap-2">
            <div className="surface-inset p-2.5">
              <span className="telemetry-label text-[9px]">SPEED LIMIT</span>
              <div className="font-bold text-base text-accent mt-0.5">
                {speedLimitKmh} <span className="text-[10px] text-text-muted">KM/H</span>
              </div>
            </div>
            <div className="surface-inset p-2.5">
              <span className="telemetry-label text-[9px]">TRAFFIC</span>
              <div className="font-bold text-base text-success mt-0.5">
                MODERATE
              </div>
            </div>
          </div>

          {/* Construction & Next Sign */}
          <div className="surface-inset p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="telemetry-label text-[9px]">CONSTRUCTION</span>
              <span className="text-text-primary font-bold text-[11px]">
                {roadContext?.construction_warning ? 'ACTIVE (250m)' : 'NONE REPORTED'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="telemetry-label text-[9px]">NEXT SIGN</span>
              <span className="text-accent font-bold text-[11px] truncate max-w-[150px]">
                PEDESTRIAN CROSSING
              </span>
            </div>
          </div>

          {/* Nearby Emergency Garages List */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="telemetry-label text-[10px]">NEARBY VERIFIED GARAGES</span>
              <span className="text-[10px] text-accent">{garages.length} TRIAGED</span>
            </div>

            <div className="space-y-2">
              {garages.slice(0, 3).map((g) => (
                <div key={g.id} className="surface-inset p-2.5 space-y-1 hover:border-accent/30 transition-colors">
                  <div className="flex items-center justify-between font-headline font-bold text-xs text-text-primary">
                    <span className="truncate max-w-[170px]">{g.name}</span>
                    <span className="font-mono text-accent text-[11px]">{g.distance_meters}m</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>★ {g.rating.toFixed(1)}</span>
                    <a
                      href={`tel:${g.phone}`}
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="w-2.5 h-2.5" />
                      <span>{g.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
