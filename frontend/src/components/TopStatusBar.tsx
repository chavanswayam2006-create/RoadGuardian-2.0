import React from 'react';
import { Menu, Volume2, VolumeX, Bell } from 'lucide-react';
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
    <header className="fixed top-0 left-0 lg:left-[248px] right-0 h-14 bg-surface/95 backdrop-blur-md z-30 px-4 flex items-center justify-between border-b border-border">
      {/* Left side: Hamburger button on mobile + system identifier */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebarMobile}
          className="lg:hidden p-1.5 rounded bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
          <span className="text-text-primary font-bold tracking-wider">AEGIS HMI</span>
          <span>/</span>
          <span className="text-accent uppercase">CORRIDOR TELEMETRY</span>
        </div>
      </div>

      {/* Center: System Readiness Telemetry Strip */}
      <div className="hidden md:flex items-center gap-4 text-[11px] font-mono">
        {/* CAMERA ● ACTIVE */}
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="text-text-muted uppercase">CAMERA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-success font-semibold">ACTIVE</span>
        </div>

        <span className="text-border">|</span>

        {/* AI MODEL ● ONLINE */}
        <div
          className="flex items-center gap-1.5 text-text-secondary"
          title={`Node: ${health?.config?.device || 'CPU'} | Latency: ${inferenceTimeMs.toFixed(1)}ms`}
        >
          <span className="text-text-muted uppercase">AI MODEL</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-success' : 'bg-warning'
            }`}
          />
          <span
            className={`font-semibold ${
              isBackendConnected ? 'text-success' : 'text-warning'
            }`}
          >
            {isBackendConnected ? `ONLINE (${inferenceTimeMs.toFixed(0)}MS)` : 'STANDALONE'}
          </span>
        </div>

        <span className="text-border">|</span>

        {/* DRIVER MONITOR ● ACTIVE */}
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="text-text-muted uppercase">DRIVER MONITOR</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              driverState === 'ATTENTIVE'
                ? 'bg-success'
                : driverState === 'DROWSINESS_WARNING'
                ? 'bg-critical status-pulse'
                : 'bg-warning'
            }`}
          />
          <span
            className={`font-semibold ${
              driverState === 'ATTENTIVE'
                ? 'text-success'
                : driverState === 'DROWSINESS_WARNING'
                ? 'text-critical'
                : 'text-warning'
            }`}
          >
            {driverState === 'ATTENTIVE' ? 'ACTIVE' : driverState === 'DROWSINESS_WARNING' ? 'ALERT' : 'DRIFT'}
          </span>
        </div>

        <span className="text-border">|</span>

        {/* MAP ● CONNECTED */}
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="text-text-muted uppercase">MAP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-success font-semibold">CONNECTED</span>
        </div>

        <span className="text-border">|</span>

        {/* VOICE ● READY */}
        <div className="flex items-center gap-1.5 text-text-secondary">
          <span className="text-text-muted uppercase">VOICE</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isMuted ? 'bg-text-muted' : isSpeaking ? 'bg-accent status-pulse' : 'bg-success'
            }`}
          />
          <span
            className={`font-semibold ${
              isMuted ? 'text-text-muted' : isSpeaking ? 'text-accent' : 'text-success'
            }`}
          >
            {isMuted ? 'MUTED' : isSpeaking ? 'ACTIVE' : 'READY'}
          </span>
        </div>
      </div>

      {/* Right Controls: Audio Mute, Notifications, FPS */}
      <div className="flex items-center gap-2">
        {/* Quick FPS readout */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-surface-secondary text-[11px] font-mono text-text-muted border border-border-subtle">
          <span>FPS</span>
          <span className="text-accent font-bold">{fps}</span>
        </div>

        {/* Voice Mute Toggle */}
        <button
          onClick={onToggleMute}
          type="button"
          className={`p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
            isMuted
              ? 'bg-surface-secondary text-text-muted hover:text-text-primary'
              : 'bg-surface-elevated text-accent hover:bg-surface-highest'
          }`}
          title={isMuted ? 'Voice alerts muted (click to enable)' : 'Voice alerts active (click to mute)'}
          aria-label="Toggle voice alerts"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          type="button"
          className="relative p-1.5 rounded bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
          title="Telemetry notification buffer"
          aria-label="Open notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
      </div>
    </header>
  );
};
