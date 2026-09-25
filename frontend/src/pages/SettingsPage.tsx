import React, { useState } from 'react';

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
  const [hudGlow, setHudGlow] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(1.05);
  const [earThreshold, setEarThreshold] = useState<number>(0.20);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const handleSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="p-space-lg flex flex-col gap-space-lg w-full max-w-[1200px] mx-auto text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-xs border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-space-xs font-label-caps text-label-caps text-primary uppercase">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Cockpit Configuration Suite</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
            System &amp; Perception Settings
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Adjust camera sensors, neural confidence thresholds, audio synthesize properties, and privacy modes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-caps text-label-caps uppercase flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Save Preferences</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-space-sm rounded-lg bg-tertiary-container/30 border border-tertiary text-tertiary flex items-center gap-2 text-xs font-label-caps">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Settings saved to local cockpit configuration profile.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Section 1: Camera & Video Pipeline */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-[20px]">videocam</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Camera &amp; Feed Source</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-label-caps text-outline uppercase block mb-1">Optical Feed Mode</label>
              <select
                value={mode}
                onChange={(e) => onModeChange(e.target.value as any)}
                className="w-full bg-surface-container p-2 rounded-lg border border-outline-variant/30 text-on-surface font-body-sm focus:outline-none focus:border-primary"
              >
                <option value="simulated">Synthetic Procedural Road (Demo)</option>
                <option value="webcam">Live User Webcam (Direct Sensor)</option>
                <option value="sample">Static Traffic Scene (Benchmark)</option>
              </select>
            </div>

            <div>
              <label className="font-label-caps text-outline uppercase block mb-1">Target Video Resolution</label>
              <div className="p-2 bg-surface-container rounded-lg font-mono text-on-surface flex justify-between">
                <span>1080p Full HD (1920x1080)</span>
                <span className="text-tertiary font-bold">LOCKED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: AI Vision & Detection */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary text-[20px]">neurology</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">AI Detection Parameters</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-label-caps mb-1">
                <span className="text-outline uppercase">Active Speed Limit Target</span>
                <span className="text-primary font-bold">{speedLimitKmh} km/h</span>
              </div>
              <div className="flex gap-2">
                {[30, 50, 70, 100].map((lim) => (
                  <button
                    key={lim}
                    onClick={() => onSpeedLimitChange(lim)}
                    className={`flex-1 py-1.5 rounded font-label-caps ${
                      speedLimitKmh === lim
                        ? 'bg-primary-container text-on-primary-container font-bold'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {lim} km/h
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-label-caps text-outline uppercase block mb-1">Dataset Model Origin</label>
              <div className="p-2 bg-surface-container rounded-lg font-mono text-on-surface flex justify-between">
                <span>German Traffic Sign Recognition Benchmark (GTSRB)</span>
                <span className="text-tertiary font-bold">43 CLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Driver Monitoring (DMS) */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-secondary text-[20px]">visibility</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Driver Monitoring (DMS)</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-label-caps mb-1">
                <span className="text-outline uppercase">Eye Aspect Ratio (EAR) Threshold</span>
                <span className="text-secondary font-bold">{earThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="0.28"
                step="0.01"
                value={earThreshold}
                onChange={(e) => setEarThreshold(parseFloat(e.target.value))}
                className="w-full accent-secondary-container cursor-pointer"
              />
              <div className="flex justify-between font-label-caps text-[9px] text-outline mt-1">
                <span>Sensitive (0.15)</span>
                <span>Default (0.20)</span>
                <span>Aggressive (0.28)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 bg-surface-container rounded-lg">
              <span className="text-on-surface font-body-sm">Gaze Deviation Audio Warning</span>
              <span className="font-label-caps text-tertiary font-bold">ENABLED</span>
            </div>
          </div>
        </div>

        {/* Section 4: Voice Alerts (TTS) */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-[20px]">record_voice_over</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Voice Alerts &amp; Audio</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 bg-surface-container rounded-lg">
              <div>
                <span className="font-semibold block text-on-surface">Voice Synthesis Alerts</span>
                <span className="text-[11px] text-outline">Spoken audio announcements for warnings</span>
              </div>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1 rounded font-label-caps text-[10px] ${
                  isMuted
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-tertiary/20 text-tertiary font-bold'
                }`}
              >
                {isMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            <div>
              <div className="flex justify-between font-label-caps mb-1">
                <span className="text-outline uppercase">Speech Rate</span>
                <span className="text-primary font-bold">{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-primary-container cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Appearance & Cockpit HUD */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-outline text-[20px]">palette</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">HUD Visual Appearance</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2 bg-surface-container rounded-lg">
              <div>
                <span className="font-semibold block text-on-surface">Cockpit Glassmorphism &amp; Glow</span>
                <span className="text-[11px] text-outline">High-contrast tactical borders &amp; blurs</span>
              </div>
              <button
                type="button"
                onClick={() => setHudGlow((g) => !g)}
                className={`px-3 py-1 rounded font-label-caps text-[10px] ${
                  hudGlow ? 'bg-primary-container text-on-primary-container font-bold' : 'bg-surface-container text-outline'
                }`}
              >
                {hudGlow ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Privacy & Data Isolation */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2 pb-space-xs border-b border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary text-[20px]">shield</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Privacy &amp; Data Security</h2>
          </div>

          <div className="space-y-2 text-xs text-on-surface-variant">
            <div className="flex items-center justify-between p-2 bg-surface-container rounded-lg">
              <span>Local Dataset Isolation</span>
              <span className="font-label-caps text-tertiary font-bold">100% AIR-GAPPED</span>
            </div>
            <p className="text-[11px] text-outline leading-tight pt-1">
              Frames and infrared driver gaze coordinates process entirely on the local machine and are never
              transmitted to external third-party cloud servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
