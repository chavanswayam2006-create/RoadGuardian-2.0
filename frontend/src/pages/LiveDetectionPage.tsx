import React, { useState, useEffect } from 'react';
import { VisionCanvas } from '../components/VisionCanvas';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { Detection } from '../types';

interface LiveDetectionPageProps {
  mode: 'simulated' | 'webcam' | 'sample';
  onModeChange: (mode: 'simulated' | 'webcam' | 'sample') => void;
  detections: Detection[];
  inferenceTimeMs: number;
  onFrameCaptured: (base64: string) => void;
  speedLimitKmh: number;
  fps: number;
  isBackendConnected: boolean;
}

export const LiveDetectionPage: React.FC<LiveDetectionPageProps> = ({
  mode,
  onModeChange,
  detections,
  inferenceTimeMs,
  onFrameCaptured,
  speedLimitKmh,
  fps,
  isBackendConnected,
}) => {
  const [filterThreshold, setFilterThreshold] = useState<number>(0.45);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(2540); // 00:42:20 initial

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const filteredDetections = detections.filter((d) => d.confidence >= filterThreshold);

  return (
    <div className="flex flex-col w-full p-space-md gap-space-md text-on-surface max-w-[1720px] mx-auto">
      {/* HUD Status Strip */}
      <div className="grid grid-cols-12 gap-space-md items-center bg-surface-container-low px-space-md py-space-sm rounded-lg shadow-sm border border-outline-variant/20">
        <div className="col-span-12 lg:col-span-8 flex flex-wrap items-center gap-x-space-md gap-y-space-xs">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
            <span className="font-label-caps text-label-caps text-error tracking-wider uppercase">
              REC ● {formatTimer(sessionSeconds)}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-caps text-label-caps">
            <span>DEV: {mode === 'webcam' ? 'USB_WEBCAM_01' : 'OPTICAL_SIM_DSP'}</span>
            <span className="text-outline">/</span>
            <span>LATENCY: {inferenceTimeMs.toFixed(1)}ms</span>
            <span className="text-outline">/</span>
            <span className={isBackendConnected ? 'text-tertiary' : 'text-error'}>
              {isBackendConnected ? 'STREAMS: SYNC_OK' : 'AI MODEL OFFLINE'}
            </span>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex items-center justify-start lg:justify-end gap-space-sm">
          <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded">
            <span className="font-label-caps text-label-caps text-outline">NPU LOAD:</span>
            <span className="font-telemetry-display text-body-md text-primary font-bold">54%</span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded">
            <span className="font-label-caps text-label-caps text-outline">FPS:</span>
            <span className="font-telemetry-display text-body-md text-tertiary font-bold">{fps}</span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded">
            <span className="font-label-caps text-label-caps text-outline">MODE:</span>
            <span className="font-label-caps text-label-caps text-primary uppercase">{mode}</span>
          </div>
        </div>
      </div>

      {/* Backend Disconnected Warning if offline */}
      {!isBackendConnected && (
        <div className="p-space-sm bg-error-container/20 border border-error rounded-xl flex items-center justify-between text-on-error-container">
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-error text-[24px]">cloud_off</span>
            <div>
              <div className="font-headline-sm text-[15px] font-bold text-error">AI MODEL OFFLINE</div>
              <div className="font-body-sm text-[12px] text-on-surface-variant">
                FastAPI backend on http://127.0.0.1:8000 is unavailable. Running in local standalone HUD simulation.
              </div>
            </div>
          </div>
          <span className="font-label-caps text-[11px] bg-error-container text-on-error-container px-2 py-1 rounded">
            STANDALONE
          </span>
        </div>
      )}

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-12 gap-space-md">
        {/* Left Viewport: Real Vision Feed with Overlays (8 Cols) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-space-sm min-w-0">
          <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20 shadow-xl">
            {/* Feed Mode Switcher Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-space-xs pb-space-xs mb-space-xs border-b border-outline-variant/10 text-xs">
              <div className="flex items-center gap-1">
                <span className="font-label-caps text-outline uppercase pr-1">Source:</span>
                {(['simulated', 'webcam', 'sample'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => onModeChange(m)}
                    className={`px-space-sm py-1 rounded font-label-caps uppercase transition-colors ${
                      mode === m
                        ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {m === 'simulated' ? 'Road Sim' : m === 'webcam' ? 'Live Webcam' : 'Sample'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className={`px-space-sm py-1 rounded font-label-caps flex items-center gap-1 transition-colors ${
                    isPaused
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isPaused ? 'play_arrow' : 'pause'}
                  </span>
                  <span>{isPaused ? 'RESUME STREAM' : 'PAUSE'}</span>
                </button>
              </div>
            </div>

            {/* Embedded VisionCanvas (Handles real frames & SVG bounding boxes) */}
            <ErrorBoundary fallbackTitle="VISION HUD RUNTIME RECOVERY">
              <VisionCanvas
                mode={mode}
                detections={isPaused ? [] : filteredDetections}
                inferenceTimeMs={inferenceTimeMs}
                onFrameCaptured={isPaused ? () => {} : onFrameCaptured}
                speedLimitKmh={speedLimitKmh}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Right Viewport: Control Deck & Live Detections (4 Cols) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-space-md">
          {/* Model Specification Card */}
          <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20 shadow-md">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">neurology</span>
                <span className="font-headline-sm text-[15px] font-semibold text-on-surface">
                  Perception Engine
                </span>
              </div>
              <span className="font-label-caps text-[10px] bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded">
                RESNET-18 / GTSRB
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-outline">Loaded Sign Classes:</span>
                <span className="font-mono text-on-surface font-semibold">43 Classes (German GTSRB)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Top-1 Benchmark Acc:</span>
                <span className="font-mono text-tertiary font-bold">98.67%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Average Latency:</span>
                <span className="font-mono text-primary font-bold">{inferenceTimeMs.toFixed(1)} ms</span>
              </div>
            </div>

            {/* Filter Slider */}
            <div className="mt-space-md pt-space-xs border-t border-outline-variant/20">
              <div className="flex items-center justify-between font-label-caps text-[11px] mb-1">
                <span className="text-outline">Confidence Filter:</span>
                <span className="text-primary font-bold">{Math.round(filterThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.85"
                step="0.05"
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(parseFloat(e.target.value))}
                className="w-full accent-primary-container cursor-pointer"
              />
              <div className="flex justify-between font-label-caps text-[9px] text-outline mt-1">
                <span>All (20%)</span>
                <span>Balanced (45%)</span>
                <span>Strict (85%)</span>
              </div>
            </div>
          </div>

          {/* Active Detections Table Card */}
          <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20 shadow-md flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                ACTIVE TARGETS ({filteredDetections.length})
              </span>
              <span className="font-label-caps text-[10px] text-tertiary">SPATIAL TRACK</span>
            </div>

            {filteredDetections.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-space-lg text-center text-outline">
                <span className="material-symbols-outlined text-[36px] mb-2 opacity-50">search_off</span>
                <p className="font-body-sm text-[13px]">No targets detected above {Math.round(filterThreshold * 100)}% threshold.</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant mt-1">
                  Adjust slider or switch feed to 'Road Sim' / 'Sample'.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px]">
                {filteredDetections.map((det, idx) => (
                  <div
                    key={`${det.class_name}-${idx}`}
                    className="p-space-sm bg-surface-container rounded-lg border border-outline-variant/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        {det.speed_limit_kmh || idx + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline-sm text-[13px] font-semibold text-on-surface truncate">
                          {det.class_name}
                        </span>
                        <span className="font-label-caps text-[9px] text-outline">
                          BBOX: [{det.bbox.join(', ')}]
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-label-caps text-[11px] font-bold text-tertiary">
                        {Math.round(det.confidence * 100)}%
                      </span>
                      <div className="w-16 bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-tertiary h-full rounded-full"
                          style={{ width: `${Math.round(det.confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
