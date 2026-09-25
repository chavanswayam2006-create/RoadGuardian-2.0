import React from 'react';
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
  return (
    <div className="flex flex-col w-full h-[calc(100vh-4.25rem)] overflow-hidden text-on-surface">
      {/* Top Utility Contextual Rail / Simulation Strip */}
      <div className="w-full bg-surface-container-lowest px-space-md py-space-xs flex flex-wrap items-center justify-between border-b border-outline-variant/30 gap-2 shrink-0">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="font-label-caps text-label-caps bg-primary/10 text-primary px-space-xs py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            GNSS RTK LOCK (L1+L5)
          </span>
          <span className="text-outline text-body-sm">|</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            Sector:{' '}
            <strong className="text-on-surface font-medium">
              {roadContext?.road_name || 'Leopoldstraße / A99 Corridor'} (Waypoint #4802-A)
            </strong>
          </span>
          <span className="font-label-caps text-[10px] bg-surface-container-high text-tertiary px-space-xs py-0.5 rounded hidden sm:inline-block">
            HD-MAP CACHED (v24.11)
          </span>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
            <span className="font-label-caps text-[10px] text-on-surface">SIMULATED SCENARIO #04</span>
            <span className="font-label-caps text-[10px] text-outline font-normal">
              | {roadContext?.data_source || 'DEMO_DATA'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-outline font-label-caps text-[10px]">
            <span>LAT: {roadContext?.lat.toFixed(4) || '48.1371'}° N</span>
            <span>LON: {roadContext?.lon.toFixed(4) || '11.5761'}° E</span>
          </div>
        </div>
      </div>

      {/* Primary Split View: Left Map / Right Triage Cards */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Central Map Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 h-full relative overflow-hidden bg-surface-container-lowest">
          <ErrorBoundary fallbackTitle="ROAD MAP HUD STANDBY">
            <ContextMap roadContext={roadContext} garages={garages} />
          </ErrorBoundary>

          {/* Floating Road Context Overlays */}
          <div className="absolute top-4 left-4 z-[500] bg-surface/90 backdrop-blur-md p-space-sm rounded-xl border border-outline-variant/30 shadow-lg pointer-events-auto max-w-sm">
            <div className="flex items-center gap-space-xs text-primary font-label-caps text-[10px] uppercase">
              <span className="material-symbols-outlined text-[14px]">explore</span>
              <span>Active Road Trajectory</span>
            </div>
            <div className="font-headline-sm text-[16px] font-bold text-on-surface mt-1">
              {roadContext?.road_name || 'Leopoldstraße / A99'}
            </div>
            <div className="flex items-center gap-space-sm mt-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-error-container text-on-error font-bold">
                SPEED LIMIT {speedLimitKmh} KM/H
              </span>
              <span className="text-outline">Surface: Dry Asphalt</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Nearby Service Garages Triage (4 cols) */}
        <div className="lg:col-span-4 h-full bg-surface-container-low border-l border-outline-variant/30 flex flex-col overflow-hidden">
          <div className="p-space-md border-b border-outline-variant/20 flex items-center justify-between shrink-0">
            <div>
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider block">
                EMERGENCY SERVICES
              </span>
              <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">
                Nearby Verified Garages ({garages.length})
              </h2>
            </div>
            <span className="font-label-caps text-[9px] bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded font-bold">
              DEMO DATA
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-space-md space-y-space-sm">
            {garages.map((garage) => (
              <div
                key={garage.id}
                className="p-space-sm bg-surface-container rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-headline-sm text-[14px] font-semibold text-on-surface">
                      {garage.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-outline mt-0.5">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">star</span>
                      <span className="font-bold text-on-surface">{garage.rating}</span>
                      <span>•</span>
                      <span className="text-primary font-mono">{garage.distance_meters}m away</span>
                    </div>
                  </div>
                  <span
                    className={`font-label-caps text-[9px] px-1.5 py-0.5 rounded ${
                      garage.open_now
                        ? 'bg-tertiary/20 text-tertiary'
                        : 'bg-error-container/30 text-error'
                    }`}
                  >
                    {garage.open_now ? 'OPEN NOW' : 'CLOSED'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {garage.services.map((svc) => (
                    <span
                      key={svc}
                      className="font-label-caps text-[9px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded"
                    >
                      {svc}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-outline-variant/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-outline">{garage.phone}</span>
                  <a
                    href={`tel:${garage.phone}`}
                    className="px-2 py-1 rounded bg-primary-container text-on-primary-container font-label-caps text-[10px] flex items-center gap-1 hover:bg-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">call</span>
                    <span>Direct Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Automotive Help & Dispatcher Note */}
          <div className="p-space-sm bg-surface-container border-t border-outline-variant/20 text-[11px] text-outline flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">support_agent</span>
            <span>Overpass API fallback active. Pre-mapped Munich service stations.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
