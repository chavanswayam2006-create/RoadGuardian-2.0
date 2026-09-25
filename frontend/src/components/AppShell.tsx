import React, { useState } from 'react';
import { Sidebar, type NavRoute } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';
import { AlertBanner } from './AlertBanner';
import { SosModal } from './SosModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import type { SystemHealth, DriverState, AlertCategory, SafetyEvent, RoadContext } from '../types';

interface AppShellProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  currentSpeedKmh: number;
  speedLimitKmh: number;
  driverState: DriverState;
  isBackendConnected: boolean;
  health: SystemHealth | null;
  inferenceTimeMs: number;
  isMuted: boolean;
  onToggleMute: () => void;
  isSpeaking: boolean;
  activeAlert: {
    category: AlertCategory;
    title: string;
    message: string;
    action_required?: string;
  } | null;
  onDismissAlert: () => void;
  events: SafetyEvent[];
  onClearEvents: () => void;
  roadContext: RoadContext | null;
  fps: number;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRoute,
  onRouteChange,
  currentSpeedKmh,
  speedLimitKmh,
  driverState,
  isBackendConnected,
  health,
  inferenceTimeMs,
  isMuted,
  onToggleMute,
  isSpeaking,
  activeAlert,
  onDismissAlert,
  events,
  onClearEvents,
  roadContext,
  fps,
  children,
}) => {
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body-md antialiased select-none">
      {/* Sidebar Navigation Suite */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        currentSpeedKmh={currentSpeedKmh}
        speedLimitKmh={speedLimitKmh}
        driverState={driverState}
        onSosTrigger={() => setIsSosOpen(true)}
        fps={fps}
      />

      {/* Main Content Wrap Offset by Sidebar width on Desktop */}
      <div className="pl-0 lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Telematics Status Bar */}
        <TopStatusBar
          onToggleSidebarMobile={() => setIsSidebarMobileOpen((o) => !o)}
          isBackendConnected={isBackendConnected}
          health={health}
          inferenceTimeMs={inferenceTimeMs}
          driverState={driverState}
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          isSpeaking={isSpeaking}
          unreadAlertCount={events.length}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          fps={fps}
        />

        {/* Global Active Priority Safety Alert Banner (if active) */}
        <div className="pt-16 px-space-md w-full max-w-[1720px] mx-auto">
          <AlertBanner alert={activeAlert} onDismiss={onDismissAlert} />
        </div>

        {/* Main View Area */}
        <main className="flex-1 w-full bg-background flex flex-col">
          {children}
        </main>
      </div>

      {/* Emergency SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        lat={roadContext?.lat || 48.1371}
        lon={roadContext?.lon || 11.5761}
        roadName={roadContext?.road_name || 'Urban Sector Corridor'}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={events}
        onClear={onClearEvents}
      />
    </div>
  );
};
