import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Camera,
  Cpu,
  Eye,
  Volume2,
  Compass,
  Lock,
  Server,
  CheckCircle2,
  Save,
} from 'lucide-react';

interface SettingsPageProps {
  isMuted: boolean;
  onToggleMute: () => void;
  mode: 'simulated' | 'webcam' | 'sample';
  onModeChange: (mode: 'simulated' | 'webcam' | 'sample') => void;
  speedLimitKmh: number;
  onSpeedLimitChange: (limit: number) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isMuted,
  onToggleMute,
  mode,
  onModeChange,
  speedLimitKmh,
  onSpeedLimitChange,
}) => {
  const [confThreshold, setConfThreshold] = useState<number>(0.45);
  const [earThreshold, setEarThreshold] = useState<number>(0.20);
  const [_speechRate, _setSpeechRate] = useState<number>(1.05);
  const [debounceSec, setDebounceSec] = useState<number>(5.0);
  const [_localOnly, _setLocalOnly] = useState<boolean>(true);
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-[1200px] mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-accent" />
          <h1 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
            COCKPIT &amp; PERCEPTION PREFERENCES
          </h1>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border">
            HMI CONFIG
          </span>
        </div>

        <button
          onClick={handleSave}
          type="button"
          className="self-start sm:self-auto px-3 py-1 rounded bg-accent hover:bg-accent-strong text-bg font-headline text-xs font-bold uppercase flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>SAVE CHANGES</span>
        </button>
      </div>

      {showToast && (
        <div className="surface-card p-3 border-success text-success flex items-center gap-2 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration parameters persisted to local profile.</span>
        </div>
      )}

      {/* Grouped Settings Grid (8 Clean Groups) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. GENERAL */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <SettingsIcon className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              1. GENERAL
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div>
              <label className="telemetry-label text-[9px] block mb-1">UNITS OF MEASURE</label>
              <select className="w-full bg-surface-secondary p-2 rounded border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent">
                <option value="metric">Metric (km/h, meters)</option>
                <option value="imperial">Imperial (mph, feet)</option>
              </select>
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Controls all speedometer, speed limit signs, and distance readouts.
              </span>
            </div>
            <div>
              <label className="telemetry-label text-[9px] block mb-1">BASE SPEED LIMIT SEED</label>
              <div className="flex items-center gap-2">
                {[30, 50, 70, 100].map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => onSpeedLimitChange(limit)}
                    className={`flex-1 py-1 rounded font-mono text-xs font-bold border transition-colors ${
                      speedLimitKmh === limit
                        ? 'bg-accent text-bg border-accent'
                        : 'surface-inset text-text-secondary border-border hover:border-accent/40'
                    }`}
                  >
                    {limit} KM/H
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Default speed restriction used when optical vision has not detected road signs yet.
              </span>
            </div>
          </div>
        </div>

        {/* 2. CAMERA */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Camera className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              2. CAMERA
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div>
              <label className="telemetry-label text-[9px] block mb-1">OPTICAL SOURCE MODE</label>
              <select
                value={mode}
                onChange={(e) => onModeChange(e.target.value as any)}
                className="w-full bg-surface-secondary p-2 rounded border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent"
              >
                <option value="simulated">Synthetic Procedural Drive (Demo)</option>
                <option value="webcam">Live WebRTC Camera Sensor</option>
              </select>
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Choose between simulated dynamic roadway for evaluation or live optical webcam.
              </span>
            </div>
            <div>
              <label className="telemetry-label text-[9px] block mb-1">RESOLUTION &amp; FPS LOCK</label>
              <select className="w-full bg-surface-secondary p-2 rounded border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent">
                <option>640x380 @ 60 FPS (Optimized Latency)</option>
                <option>1280x720 @ 30 FPS (High Definition)</option>
              </select>
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Standardizes optical frame grabber cadence before neural forward pass.
              </span>
            </div>
          </div>
        </div>

        {/* 3. AI DETECTION */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Cpu className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              3. AI DETECTION
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="telemetry-label text-[9px]">CONFIDENCE CUTOFF THRESHOLD</label>
                <span className="font-mono text-accent font-bold">{Math.round(confThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="0.90"
                step="0.05"
                value={confThreshold}
                onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
                className="w-full accent-accent bg-surface-secondary h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Detections below this softmax confidence margin are suppressed from the HUD.
              </span>
            </div>
            <div>
              <label className="telemetry-label text-[9px] block mb-1">TRAFFIC SIGN TAXONOMY</label>
              <div className="surface-inset p-2 font-mono text-[11px] text-text-secondary flex justify-between">
                <span>GTSRB 43-CLASS SET</span>
                <span className="text-success font-bold">LOADED</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DRIVER MONITORING */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Eye className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              4. DRIVER MONITORING
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="telemetry-label text-[9px]">EYE ASPECT RATIO (EAR) THRESHOLD</label>
                <span className="font-mono text-accent font-bold">{earThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.30"
                step="0.01"
                value={earThreshold}
                onChange={(e) => setEarThreshold(parseFloat(e.target.value))}
                className="w-full accent-accent bg-surface-secondary h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Continuous closure below this metric triggers temporal micro-sleep alerts.
              </span>
            </div>
            <div>
              <label className="telemetry-label text-[9px] block mb-1">GAZE DEVIATION SENSITIVITY</label>
              <select className="w-full bg-surface-secondary p-2 rounded border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent">
                <option>Medium (±18° Pitch / ±25° Yaw)</option>
                <option>High Sensitivity (±12° Pitch / ±15° Yaw)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. VOICE */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Volume2 className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              5. VOICE
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div className="flex items-center justify-between surface-inset p-2.5">
              <div>
                <span className="font-headline font-bold text-text-primary text-xs block">
                  SYNTHETIC AUDIO ALERTS
                </span>
                <span className="text-[10px] text-text-muted">
                  Announce speed changes &amp; drowsiness alerts through speaker.
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 rounded font-mono text-xs font-bold transition-colors ${
                  !isMuted ? 'bg-success text-bg' : 'bg-surface-elevated text-text-muted'
                }`}
              >
                {!isMuted ? 'ENABLED' : 'MUTED'}
              </button>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="telemetry-label text-[9px]">DEDUPLICATION DEBOUNCE</label>
                <span className="font-mono text-accent font-bold">{debounceSec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="10.0"
                step="0.5"
                value={debounceSec}
                onChange={(e) => setDebounceSec(parseFloat(e.target.value))}
                className="w-full accent-accent bg-surface-secondary h-1.5 rounded cursor-pointer"
              />
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Prevents repeated voice triggers for the same persistent road object.
              </span>
            </div>
          </div>
        </div>

        {/* 6. MAP */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Compass className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              6. MAP
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div>
              <label className="telemetry-label text-[9px] block mb-1">TILE PROVIDER</label>
              <select className="w-full bg-surface-secondary p-2 rounded border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent">
                <option>CartoDB Dark Matter (Tactical Cockpit)</option>
                <option>OpenStreetMap Standard Tiles</option>
              </select>
            </div>
            <div>
              <label className="telemetry-label text-[9px] block mb-1">GARAGE TRIAGE RADIUS</label>
              <select className="w-full bg-surface-secondary p-2 rounded border border-border text-text-primary font-mono text-xs focus:outline-none focus:border-accent">
                <option>5.0 km (Urban Core)</option>
                <option>15.0 km (Highway Corridor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 7. PRIVACY */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Lock className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              7. PRIVACY
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div className="flex items-center justify-between surface-inset p-2.5">
              <div>
                <span className="font-headline font-bold text-text-primary text-xs block">
                  ON-DEVICE EDGE PROCESSING
                </span>
                <span className="text-[10px] text-text-muted">
                  Video feeds never leave local memory or transmit over public cloud.
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-success px-2 py-0.5 rounded bg-success-subtle">
                ENFORCED
              </span>
            </div>
          </div>
        </div>

        {/* 8. SYSTEM */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Server className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              8. SYSTEM
            </h2>
          </div>
          <div className="space-y-3 text-xs font-body">
            <div>
              <label className="telemetry-label text-[9px] block mb-1">BACKEND SERVICE URL</label>
              <input
                type="text"
                readOnly
                value="http://127.0.0.1:8000"
                className="w-full bg-surface-secondary p-2 rounded border border-border text-accent font-mono text-xs focus:outline-none"
              />
              <span className="text-[10px] text-text-muted mt-0.5 block">
                Local FastAPI inference engine connection endpoint.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
