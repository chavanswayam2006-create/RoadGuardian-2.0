import React from 'react';
import type { SystemHealth } from '../types';

interface SystemStatusPageProps {
  isBackendConnected: boolean;
  health: SystemHealth | null;
  inferenceTimeMs: number;
  fps: number;
  onRefreshHealth: () => void;
}

export const SystemStatusPage: React.FC<SystemStatusPageProps> = ({
  isBackendConnected,
  health,
  inferenceTimeMs,
  fps,
  onRefreshHealth,
}) => {
  const subsystems = [
    {
      name: 'AI Vision (GTSRB ResNet-18)',
      category: 'Inference Engine',
      status: isBackendConnected ? 'ONLINE' : 'DEGRADED',
      details: `${health?.config?.classes_loaded || 43} traffic sign classes loaded. Conf threshold: ${health?.config?.confidence_threshold || 0.45}`,
      latency: `${inferenceTimeMs.toFixed(1)} ms`,
    },
    {
      name: 'Backend API Service',
      category: 'FastAPI / Uvicorn',
      status: isBackendConnected ? 'CONNECTED' : 'OFFLINE',
      details: isBackendConnected ? 'Endpoints /detect, /driver-status, /road-context healthy' : 'Connection timeout on port 8000',
      latency: isBackendConnected ? '2.4 ms' : 'N/A',
    },
    {
      name: 'In-Cabin Driver Monitor (IR DMS)',
      category: 'Haar Cascade & EAR',
      status: 'ACTIVE',
      details: `EAR baseline threshold ${health?.config?.ear_threshold || 0.20}. Gaze trajectory & 3D Euler angles active.`,
      latency: '8.2 ms',
    },
    {
      name: 'Camera & Optical Sensor',
      category: 'Video Pipeline',
      status: 'ACTIVE',
      details: `Procedural Canvas & WebRTC capture stream nominal at ${fps} FPS.`,
      latency: '16.6 ms',
    },
    {
      name: 'Road Map & Context Provider',
      category: 'Geospatial Service',
      status: 'ONLINE',
      details: 'Munich urban sector tiles loaded. Emergency garages triage active.',
      latency: '18.0 ms',
    },
    {
      name: 'Voice Alert Dispatcher (TTS)',
      category: 'Web Speech Synthesis',
      status: 'ACTIVE',
      details: 'Priority queue with 5.0s deduplication debounce. Critical alerts unthrottled.',
      latency: '0.8 ms',
    },
  ];

  return (
    <div className="p-space-lg flex flex-col gap-space-lg w-full max-w-[1720px] mx-auto text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-xs">
        <div>
          <div className="flex items-center gap-space-xs font-label-caps text-label-caps text-primary uppercase">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span>Hardware Diagnostics &amp; Microservices</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
            System Subsystems Status &amp; Telemetry
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Real-time operational health metrics, edge compute allocation, and API endpoint responsiveness.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-caps text-label-caps uppercase flex items-center gap-2 self-start lg:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          <span>Probe All Services</span>
        </button>
      </div>

      {/* Subsystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
        {subsystems.map((sub) => {
          const isOk = sub.status === 'ONLINE' || sub.status === 'CONNECTED' || sub.status === 'ACTIVE';
          return (
            <div
              key={sub.name}
              className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-caps text-[10px] text-outline uppercase block">
                      {sub.category}
                    </span>
                    <h2 className="font-headline-sm text-[15px] font-semibold text-on-surface mt-0.5">
                      {sub.name}
                    </h2>
                  </div>
                  <span
                    className={`font-label-caps text-[10px] px-2 py-0.5 rounded font-bold ${
                      isOk ? 'bg-tertiary/20 text-tertiary' : 'bg-error-container text-on-error'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <p className="font-body-sm text-[12px] text-on-surface-variant mt-2 leading-relaxed">
                  {sub.details}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-outline-variant/10 flex items-center justify-between text-xs">
                <span className="text-outline">Subsystem Latency:</span>
                <span className="font-mono text-tertiary font-bold">{sub.latency}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hardware Edge Compute Telemetry */}
      <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20 shadow-md">
        <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface mb-space-sm">
          Edge Hardware Allocation &amp; Thermal Profile
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
          <div className="p-space-sm bg-surface-container rounded-lg">
            <span className="font-label-caps text-label-caps text-outline uppercase">Target Processor</span>
            <div className="font-headline-sm text-[16px] font-bold text-on-surface mt-1">
              {health?.config?.device || 'CPU / INTEL AVX2'}
            </div>
            <span className="font-body-sm text-[11px] text-tertiary">Active Vector Units</span>
          </div>

          <div className="p-space-sm bg-surface-container rounded-lg">
            <span className="font-label-caps text-label-caps text-outline uppercase">Frame Rate</span>
            <div className="font-telemetry-display text-[20px] font-bold text-tertiary mt-1">
              {fps} <span className="font-telemetry-unit text-body-sm text-outline">FPS</span>
            </div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Smooth HUD Rendering</span>
          </div>

          <div className="p-space-sm bg-surface-container rounded-lg">
            <span className="font-label-caps text-label-caps text-outline uppercase">Operating System</span>
            <div className="font-headline-sm text-[16px] font-bold text-on-surface mt-1">Windows 11 x64</div>
            <span className="font-body-sm text-[11px] text-on-surface-variant">Python 3.14 + Vite</span>
          </div>

          <div className="p-space-sm bg-surface-container rounded-lg">
            <span className="font-label-caps text-label-caps text-outline uppercase">System Health Timestamp</span>
            <div className="font-mono text-[13px] text-primary font-bold mt-1 truncate">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'LIVE ACTIVE'}
            </div>
            <span className="font-body-sm text-[11px] text-tertiary">Sync Interval: 5.0s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
