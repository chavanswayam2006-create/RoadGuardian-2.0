import React, { useState } from 'react';
import { Sidebar, type NavRoute } from './Sidebar';
import { TopStatusBar } from './TopStatusBar';
import { AlertBanner } from './AlertBanner';
import { SosModal } from './SosModal';
import { NotificationsDrawer } from './NotificationsDrawer';
import { ErrorBoundary } from './ErrorBoundary';
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
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-body antialiased select-none">
      {/* Precision Left Sidebar */}
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

      {/* Main Content Layout Shifted by 248px on Desktop */}
      <div className="pl-0 lg:pl-[248px] flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Telematics Status Bar */}
        <TopStatusBar
          onToggleSidebarMobile={() => setIsSidebarMobileOpen((prev) => !prev)}
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

        {/* Global Floating Active Alert (Dominant only during Warning/Critical) */}
        {activeAlert && (
          <div className="pt-16 px-4 md:px-6 w-full max-w-[1600px] mx-auto z-20">
            <AlertBanner alert={activeAlert} onDismiss={onDismissAlert} />
          </div>
        )}

        {/* Main Routed Page Surface */}
        <main className={`flex-1 w-full flex flex-col ${activeAlert ? 'pt-2' : 'pt-16'}`}>
          <ErrorBoundary fallbackTitle="PAGE MODULE RECOVERY">
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Emergency SOS Confirmation Dialog Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        lat={roadContext?.lat || 48.1371}
        lon={roadContext?.lon || 11.5761}
        roadName={roadContext?.road_name || 'Leopoldstraße / A99'}
      />

      {/* Right Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={events}
        onClearEvents={onClearEvents}
      />
    </div>
  );
};
