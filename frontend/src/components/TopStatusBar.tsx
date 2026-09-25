import React from 'react';
import type { SystemHealth, DriverState } from '../types';

interface TopStatusBarProps {
  onToggleSidebarMobile: () => void;
  isBackendConnected: boolean;
  health: SystemHealth | null;
  inferenceTimeMs: number;
  driverState: DriverState;
  isMuted: boolean;
  onToggleMute: () => void;
  isSpeaking: boolean;
  unreadAlertCount: number;
  onOpenNotifications: () => void;
  fps: number;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  onToggleSidebarMobile,
  isBackendConnected,
  health,
  inferenceTimeMs,
  driverState,
  isMuted,
  onToggleMute,
  isSpeaking,
  unreadAlertCount,
  onOpenNotifications,
  fps,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl z-30 px-space-md flex items-center justify-between border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      {/* Left side: Hamburger button + Telematics breadcrumb */}
      <div className="flex items-center gap-space-sm">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="flex items-center gap-space-xs">
          <span className="font-label-caps text-label-caps text-primary uppercase hidden sm:inline-block">
            Telematics Core
          </span>
          <span className="text-outline text-[12px] hidden sm:inline-block">/</span>
          <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded-full bg-tertiary-container/20 text-tertiary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
            SESSION ACTIVE - CRUISE MODE
          </span>
        </div>
      </div>

      {/* Center telemetry telemetry chips (visible on desktop) */}
      <div className="hidden xl:flex items-center gap-space-md">
        <div className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span>FRONT-CAM: 1080p @ {fps}FPS</span>
        </div>

        <div className="flex items-center gap-1 font-label-caps text-label-caps text-primary">
          <span className="material-symbols-outlined text-[15px]">neurology</span>
          <span>GTSRB-CNN: {inferenceTimeMs.toFixed(1)}ms</span>
        </div>

        <div className="flex items-center gap-1 font-label-caps text-label-caps text-tertiary">
          <span className="material-symbols-outlined text-[15px]">center_focus_strong</span>
          <span>
            IR DMS:{' '}
            {driverState === 'ATTENTIVE'
              ? 'ATTENTIVE (98%)'
              : driverState === 'DROWSINESS_WARNING'
              ? 'DROWSINESS ALERT'
              : 'ATTENTION DRIFT'}
          </span>
        </div>

        <div className="flex items-center gap-1 font-label-caps text-label-caps text-on-surface-variant">
          <span className="material-symbols-outlined text-[15px]">dns</span>
          <span className={isBackendConnected ? 'text-tertiary' : 'text-error'}>
            {isBackendConnected
              ? `EDGE NODE: CONNECTED (${health?.config.device || 'CPU'})`
              : 'EDGE NODE: OFFLINE'}
          </span>
        </div>
      </div>

      {/* Right controls: Mute audio, notifications, user profile */}
      <div className="flex items-center gap-space-sm">
        {/* Voice alerts toggle button */}
        <button
          onClick={onToggleMute}
          type="button"
          className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
            isMuted
              ? 'bg-surface-container text-outline hover:text-on-surface'
              : isSpeaking
              ? 'bg-primary-container text-on-primary-container animate-pulse shadow-sm'
              : 'bg-surface-container hover:bg-surface-container-high text-tertiary'
          }`}
          title={isMuted ? 'Voice Alerts Muted (Click to Unmute)' : 'Voice Alerts Active (Click to Mute)'}
          aria-label={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>

        {/* Notifications button with badge */}
        <button
          onClick={onOpenNotifications}
          type="button"
          className="relative p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
          aria-label="View recent safety notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 font-label-caps text-[10px] w-4 h-4 bg-error text-on-error rounded-full flex items-center justify-center font-bold">
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </span>
          )}
        </button>

        {/* User / Pilot Profile avatar */}
        <div className="flex items-center gap-space-xs pl-space-xs border-l border-outline-variant/30">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-body-sm text-[12px] text-on-surface font-medium leading-none">
              Capt. Miller
            </span>
            <span className="font-label-caps text-[9px] text-outline leading-tight mt-0.5">
              Pilot Demo
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
