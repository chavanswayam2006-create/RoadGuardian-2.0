import React from 'react';
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
    icon: string;
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: 'dashboard',
    },
    {
      id: 'detection',
      label: 'Live Detection',
      icon: 'videocam',
      badge: (
        <span className="font-label-caps text-[10px] bg-tertiary/20 text-tertiary px-1.5 py-0.5 rounded-full">
          LIVE {fps}FPS
        </span>
      ),
    },
    {
      id: 'driver-monitoring',
      label: 'Driver Monitoring',
      icon: 'visibility',
      badge: (
        <span
          className={`flex items-center gap-1 font-label-caps text-[10px] ${
            driverState === 'ATTENTIVE'
              ? 'text-tertiary'
              : driverState === 'DROWSINESS_WARNING'
              ? 'text-error'
              : 'text-secondary'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              driverState === 'ATTENTIVE'
                ? 'bg-tertiary animate-pulse'
                : driverState === 'DROWSINESS_WARNING'
                ? 'bg-error animate-ping'
                : 'bg-secondary'
            }`}
          />
          {driverState === 'ATTENTIVE' ? 'ATTENTIVE' : driverState === 'DROWSINESS_WARNING' ? 'DROWSY' : 'DRIFT'}
        </span>
      ),
    },
    {
      id: 'map',
      label: 'Road Map',
      icon: 'explore',
      badge: (
        <span className="font-label-caps text-[10px] bg-primary-container/30 text-primary px-1.5 py-0.5 rounded-full">
          GPS ACTIVE
        </span>
      ),
    },
    {
      id: 'history',
      label: 'History Log',
      icon: 'history',
    },
    {
      id: 'analytics',
      label: 'Safety Analytics',
      icon: 'analytics',
    },
    {
      id: 'system',
      label: 'System Status',
      icon: 'memory',
      badge: (
        <span className="font-label-caps text-[10px] bg-tertiary-container/30 text-tertiary px-1.5 py-0.5 rounded-full">
          ONLINE
        </span>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
    },
    {
      id: 'help',
      label: 'Help & Safety',
      icon: 'help_center',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-lowest flex flex-col z-50 shadow-[0_1px_12px_rgba(0,0,0,0.5)] border-r border-outline-variant/30 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-space-md flex items-center justify-between bg-surface-container-low border-b border-outline-variant/20">
          <div className="flex items-center gap-space-sm min-w-0">
            <BrandLogo size={34} />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-[17px] text-primary tracking-tight leading-tight truncate">
                RoadGuard AI
              </span>
              <span className="font-label-caps text-[10px] text-tertiary tracking-widest leading-none mt-0.5">
                ASSIST PROTOCOL v2.4
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close sidebar navigation"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-space-sm py-space-md">
          <div className="px-space-sm pb-space-xs font-label-caps text-[10px] text-outline uppercase tracking-wider">
            Navigation Suite
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onRouteChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-space-sm py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="font-body-md text-[13px]">{item.label}</span>
                  </div>
                  {item.badge}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Cockpit Status & Telemetry Module */}
        <div className="p-space-sm bg-surface-container-low border-t border-outline-variant/20 flex flex-col gap-space-xs">
          <div className="p-space-xs bg-surface-container rounded-lg flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
              Simulation Mode
            </span>
            <span className="font-label-caps text-[10px] bg-surface-container-high text-primary px-space-xs py-0.5 rounded font-bold">
              ACTIVE
            </span>
          </div>

          <div className="p-space-xs bg-surface-container rounded-lg flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-caps text-[10px] text-outline uppercase">Velocity</span>
              <span className="font-telemetry-display text-[18px] text-tertiary leading-none mt-0.5">
                {Math.round(currentSpeedKmh)}{' '}
                <span className="font-telemetry-unit text-[11px] text-on-surface-variant">km/h</span>
              </span>
            </div>
            <div className="text-right">
              <span className="font-label-caps text-[10px] text-outline uppercase block">Posted</span>
              <span className="font-label-caps text-[11px] text-on-surface font-semibold">
                Limit {speedLimitKmh}
              </span>
            </div>
          </div>

          <button
            onClick={onSosTrigger}
            type="button"
            className="w-full py-2 bg-error-container text-on-error-container font-label-caps text-[11px] uppercase rounded-lg flex items-center justify-center gap-space-xs hover:bg-error hover:text-on-error transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">sos</span>
            <span>SOS Emergency Hotline</span>
          </button>
        </div>
      </aside>
    </>
  );
};
