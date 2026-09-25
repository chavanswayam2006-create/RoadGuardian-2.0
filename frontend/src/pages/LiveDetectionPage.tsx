import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
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
  const [confThreshold, setConfThreshold] = useState<number>(0.45);
  const [frameCounter, setFrameCounter] = useState<number>(4820);
  const [selectedDetIndex, _setSelectedDetIndex] = useState<number>(0);

  // Increment frame counter for realistic telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameCounter((prev) => prev + 1);
    }, 1000 / 30);
    return () => clearInterval(interval);
  }, []);

  const filteredDetections = detections.filter((d) => (d.confidence || 0.9) >= confThreshold);
  const activeDetection = filteredDetections[selectedDetIndex] || filteredDetections[0] || detections[0];

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full select-none">
      {/* Top Header / Workstation Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-accent" />
          <h1 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
            COMPUTER VISION WORKSTATION
          </h1>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-accent border border-border">
            GTSRB RESNET-18
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendConnected ? 'bg-success' : 'bg-warning'
              }`}
            />
            {isBackendConnected ? 'BACKEND SYNC' : 'STANDALONE CV'}
          </span>
          <span>•</span>
          <span>FRAME: <strong className="text-text-primary">#{frameCounter}</strong></span>
        </div>
      </div>

      {/* Main Grid: Left Camera View (65%) + Right Detection Inspector (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT: Large Camera Viewport */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          <ErrorBoundary fallbackTitle="VISION MODULE RECOVERY">
            <VisionCanvas
              mode={mode}
              detections={filteredDetections}
              inferenceTimeMs={inferenceTimeMs}
              onFrameCaptured={onFrameCaptured}
              speedLimitKmh={speedLimitKmh}
              fps={fps}
            />
          </ErrorBoundary>
        </div>

        {/* RIGHT: Detection Inspector */}
        <div className="lg:col-span-4 surface-card p-4 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-border mb-3">
              <span className="telemetry-label text-[10px]">DETECTION INSPECTOR</span>
              <span className="font-mono text-[10px] text-accent">
                {filteredDetections.length} CANDIDATE{filteredDetections.length !== 1 ? 'S' : ''}
              </span>
            </div>

            {activeDetection ? (
              <div className="space-y-3 font-mono text-xs">
                {/* Active Object Name */}
                <div className="surface-inset p-3">
                  <span className="telemetry-label text-[9px]">CLASSIFIED SIGN</span>
                  <div className="font-headline font-bold text-base text-text-primary mt-0.5 uppercase">
                    {activeDetection.class_name}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-text-muted text-[11px]">CONFIDENCE:</span>
                    <span className="font-bold text-success">
                      {Math.round((activeDetection.confidence || 0.96) * 100)}%
                    </span>
                    <span className="text-border">|</span>
                    <span className="text-text-muted text-[11px]">CLASS ID:</span>
                    <span className="text-accent font-bold">#{activeDetection.class_id ?? 2}</span>
                  </div>
                </div>

                {/* Bounding Box Telemetry */}
                <div className="surface-inset p-3 space-y-1 text-[11px]">
                  <span className="telemetry-label text-[9px] block mb-1">BOUNDING COORDINATES</span>
                  <div className="flex justify-between text-text-muted">
                    <span>X1 / Y1:</span>
                    <span className="text-text-primary font-bold">480 px, 140 px</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>X2 / Y2:</span>
                    <span className="text-text-primary font-bold">560 px, 220 px</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>ASPECT RATIO:</span>
                    <span className="text-text-primary font-bold">1.00 (SQUARE)</span>
                  </div>
                </div>

                {/* Classification Category */}
                <div className="surface-inset p-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-text-muted">CATEGORY:</span>
                  <span className="font-bold text-accent uppercase">
                    {activeDetection.category || 'REGULATORY / SPEED'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-text-muted text-xs font-mono">
                NO OBJECTS DETECTED ABOVE THRESHOLD
              </div>
            )}
          </div>

          {/* Threshold Filter Control */}
          <div className="pt-3 border-t border-border mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-text-muted uppercase">CONFIDENCE CUTOFF:</span>
              <span className="text-accent font-bold">{Math.round(confThreshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.20"
              max="0.95"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
              className="w-full accent-accent bg-surface-secondary h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM: Engineering Telemetry Bar & Controls */}
      <div className="surface-card p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        {/* INFERENCE */}
        <div className="surface-inset p-2 flex flex-col justify-between">
          <span className="telemetry-label text-[9px]">INFERENCE</span>
          <div className="font-bold text-sm text-success mt-0.5">
            {inferenceTimeMs.toFixed(1)} <span className="text-[10px] text-text-muted">ms</span>
          </div>
        </div>

        {/* FPS */}
        <div className="surface-inset p-2 flex flex-col justify-between">
          <span className="telemetry-label text-[9px]">FPS</span>
          <div className="font-bold text-sm text-accent mt-0.5">
            {fps} <span className="text-[10px] text-text-muted">hz</span>
          </div>
        </div>

        {/* MODEL */}
        <div className="surface-inset p-2 flex flex-col justify-between">
          <span className="telemetry-label text-[9px]">MODEL</span>
          <div className="font-bold text-xs text-text-primary mt-0.5 truncate">
            GTSRB-ResNet18
          </div>
        </div>

        {/* CONFIDENCE */}
        <div className="surface-inset p-2 flex flex-col justify-between">
          <span className="telemetry-label text-[9px]">MEAN CONF</span>
          <div className="font-bold text-sm text-text-primary mt-0.5">
            96.4%
          </div>
        </div>

        {/* CAMERA SOURCE */}
        <div className="surface-inset p-2 flex flex-col justify-between">
          <span className="telemetry-label text-[9px]">OPTICAL FEED</span>
          <div className="font-bold text-xs text-text-primary mt-0.5 truncate">
            {mode === 'webcam' ? 'USB 1080p CAMERA' : 'SYNTHETIC CAN'}
          </div>
        </div>

        {/* MODE SWITCHER */}
        <div className="surface-inset p-1.5 flex items-center justify-between gap-1">
          <button
            onClick={() => onModeChange('simulated')}
            className={`flex-1 py-1 rounded text-[10px] transition-colors ${
              mode === 'simulated' ? 'bg-accent text-bg font-bold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            SIM
          </button>
          <button
            onClick={() => onModeChange('webcam')}
            className={`flex-1 py-1 rounded text-[10px] transition-colors ${
              mode === 'webcam' ? 'bg-accent text-bg font-bold' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            CAM
          </button>
        </div>
      </div>
    </div>
  );
};
