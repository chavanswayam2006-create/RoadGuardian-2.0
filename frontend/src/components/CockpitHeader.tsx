import React from 'react';
import { Volume2, VolumeX, Shield, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import type { SystemHealth } from '../types';

interface CockpitHeaderProps {
  health: SystemHealth | null;
  isBackendConnected: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isSpeaking: boolean;
  mode: 'simulated' | 'webcam' | 'sample';
  onModeChange: (mode: 'simulated' | 'webcam' | 'sample') => void;
  currentSpeedKmh: number;
  speedLimitKmh: number;
  isOverspeed: boolean;
  fps: number;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  health,
  isBackendConnected,
  isMuted,
  onToggleMute,
  isSpeaking,
  mode,
  onModeChange,
  currentSpeedKmh,
  speedLimitKmh,
  isOverspeed,
  fps,
}) => {
  const [timeStr, setTimeStr] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="hud-card hud-brackets mb-4 p-3 border-slate-700 bg-slate-900/90 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <Shield className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase" style={{ margin: 0 }}>
                Road<span className="text-cyan-400">Guardian</span> <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">2.0</span>
              </h1>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">HUD TACTICAL COCKPIT</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                {isBackendConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">BACKEND ONLINE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 font-mono">STANDALONE HUD MODE</span>
                  </>
                )}
              </span>
              <span>•</span>
              <span className="font-mono text-cyan-300">{health?.config.device || 'CPU / INTEL ACCEL'}</span>
              <span>•</span>
              <span className="font-mono text-slate-300">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Central Telemetry: Speedometer & Speed Limit HUD */}
        <div className="flex items-center gap-4 px-4 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
          {/* Active Speed Limit Sign */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-4 border-red-600 bg-white flex items-center justify-center shadow-md">
              <span className="text-slate-900 font-extrabold text-sm font-mono tracking-tighter">
                {speedLimitKmh}
              </span>
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">LIMIT</div>
              <div className="text-xs font-semibold text-slate-200">MAX SPEED</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Vehicle Simulated Speedometer */}
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold font-mono ${isOverspeed ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
              {currentSpeedKmh.toFixed(0)}
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">KM/H</div>
              {isOverspeed ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 uppercase tracking-tight">
                  <AlertTriangle className="w-3 h-3 text-red-500" /> OVERSPEED
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-tight">
                  CRUISING
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden md:block" />

          {/* FPS Gauge */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase">REFRESH</span>
            <span className="text-xs font-mono text-cyan-400">{fps} FPS</span>
          </div>
        </div>

        {/* Right Controls: Mode Selector & Voice Alert Toggle */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex rounded-md p-1 bg-slate-950/80 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onModeChange('simulated')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'simulated'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SIMULATED ROAD
            </button>
            <button
              onClick={() => onModeChange('webcam')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'webcam'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              WEBCAM
            </button>
            <button
              onClick={() => onModeChange('sample')}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === 'sample'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GTSRB SAMPLES
            </button>
          </div>

          {/* Voice Alert Mute Button */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold transition-all ${
              isMuted
                ? 'bg-red-950/40 border-red-800 text-red-400 hover:bg-red-900/50'
                : 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400 hover:bg-cyan-900/50'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-mono">
              {isMuted ? 'MUTED' : isSpeaking ? 'VOICE ALERT...' : 'VOICE ON'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
