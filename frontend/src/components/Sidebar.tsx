import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Eye,
  Compass,
  FileText,
  BarChart3,
  Cpu,
  Settings,
  ShieldCheck,
  PhoneCall,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { DriverState } from '../types';

export type NavRoute =
  | 'dashboard'
  | 'detection'
  | 'driver-monitoring'
  | 'map'
  | 'history'
  | 'analytics'
  | 'system'
  | 'settings'
  | 'help';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentSpeedKmh: number;
  speedLimitKmh: number;
  driverState: DriverState;
  onSosTrigger: () => void;
  fps: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  isOpenMobile,
  onCloseMobile,
  currentSpeedKmh,
  speedLimitKmh,
  driverState,
  onSosTrigger,
  fps,
}) => {
  const navItems: {
    id: NavRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'OVERVIEW',
      icon: LayoutDashboard,
    },
    {
      id: 'detection',
      label: 'LIVE VISION',
      icon: Camera,
      badge: (
        <span className="font-mono text-[10px] text-accent px-1.5 py-0.5 rounded bg-accent-subtle">
          {fps} FPS
        </span>
      ),
    },
    {
      id: 'driver-monitoring',
      label: 'DRIVER MONITOR',
      icon: Eye,
      badge: (
        <span
          className={`flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded ${
            driverState === 'ATTENTIVE'
              ? 'bg-success-subtle text-success'
              : driverState === 'DROWSINESS_WARNING'
              ? 'bg-critical-subtle text-critical'
              : 'bg-warning-subtle text-warning'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              driverState === 'ATTENTIVE'
                ? 'bg-success'
                : driverState === 'DROWSINESS_WARNING'
                ? 'bg-critical'
                : 'bg-warning'
            }`}
          />
          {driverState === 'ATTENTIVE' ? 'ACTIVE' : driverState === 'DROWSINESS_WARNING' ? 'DROWSY' : 'DRIFT'}
        </span>
      ),
    },
    {
      id: 'map',
      label: 'ROAD MAP',
      icon: Compass,
      badge: (
        <span className="font-mono text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-surface-elevated">
          GPS LOCK
        </span>
      ),
    },
    {
      id: 'history',
      label: 'DETECTIONS',
      icon: FileText,
    },
    {
      id: 'analytics',
      label: 'ANALYTICS',
      icon: BarChart3,
    },
    {
      id: 'system',
      label: 'SYSTEM',
      icon: Cpu,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: Settings,
    },
    {
      id: 'help',
      label: 'HELP',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[248px] bg-surface z-50 flex flex-col border-r border-border transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
          <BrandLogo />
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Item Stack */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          <div className="px-2 pb-1.5">
            <span className="telemetry-label text-[10px] tracking-wider text-text-muted">
              NAVIGATION
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onRouteChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-elevated text-accent font-semibold border-l-2 border-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'
                    }`}
                  />
                  <span
                    className={`font-mono text-[11px] tracking-wider truncate ${
                      isActive ? 'text-text-primary font-bold' : 'text-text-secondary'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </nav>

        {/* Bottom Cockpit Quick Telemetry */}
        <div className="p-3 border-t border-border bg-surface-secondary shrink-0 space-y-2">
          {/* Speed limit compliance pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-surface border border-border-subtle">
            <div className="flex flex-col">
              <span className="telemetry-label text-[9px]">SPEED POSTED</span>
              <span className="font-mono text-xs font-bold text-text-primary">
                {currentSpeedKmh} / {speedLimitKmh} <span className="text-[10px] text-text-muted">KM/H</span>
              </span>
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                currentSpeedKmh > speedLimitKmh ? 'bg-critical status-pulse' : 'bg-success'
              }`}
            />
          </div>

          {/* Emergency SOS hotline button */}
          <button
            onClick={onSosTrigger}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded bg-critical/10 hover:bg-critical/20 text-critical border border-critical/30 transition-colors text-xs font-mono font-bold tracking-wider"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>
      </aside>
    </>
  );
};
