import React from 'react';
import { Eye, AlertTriangle, AlertCircle } from 'lucide-react';
import type { DriverStatus, DriverState, SafetyEvent } from '../types';

interface DriverMonitoringPageProps {
  driverStatus: DriverStatus;
  onSimulateState: (state: DriverState) => void;
  events: SafetyEvent[];
}

export const DriverMonitoringPage: React.FC<DriverMonitoringPageProps> = ({
  driverStatus,
  onSimulateState,
  events: _events,
}) => {
  const isDrowsy = driverStatus.state === 'DROWSINESS_WARNING';
  const isDistracted = driverStatus.state === 'ATTENTION_WARNING';
  const isAttentive = driverStatus.state === 'ATTENTIVE';

  const safeHeadPose = driverStatus.head_pose || { pitch: 0, yaw: 0, roll: 0 };
  const earPercent = Math.min(100, Math.max(0, (driverStatus.ear_average / 0.40) * 100));

  // Gaze target vector in canvas
  const gazeX = Math.max(-45, Math.min(45, (safeHeadPose.yaw || 0) * 2));
  const gazeY = Math.max(-45, Math.min(45, (safeHeadPose.pitch || 0) * 2));

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-accent" />
          <h1 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
            DRIVER AWARENESS MONITORING (IR DMS)
          </h1>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-success border border-border">
            MONITOR ACTIVE
          </span>
        </div>

        {/* State Evaluation Switchers */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-text-muted text-[10px] uppercase">SIMULATE:</span>
          <button
            onClick={() => onSimulateState('ATTENTIVE')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isAttentive ? 'bg-success text-bg font-bold' : 'surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            SAFE
          </button>
          <button
            onClick={() => onSimulateState('ATTENTION_WARNING')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isDistracted ? 'bg-warning text-bg font-bold' : 'surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            DISTRACTED
          </button>
          <button
            onClick={() => onSimulateState('DROWSINESS_WARNING')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              isDrowsy ? 'bg-critical text-bg font-bold' : 'surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            DROWSY
          </button>
        </div>
      </div>

      {/* Warning/Critical Alert Banner if triggered */}
      {isDrowsy ? (
        <div className="p-3 rounded-md bg-critical-subtle border border-critical critical-pulse text-critical flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold tracking-wider uppercase block">
                DROWSINESS WARNING: MICRO-SLEEP EVENT
              </span>
              <span className="text-[11px] text-text-secondary font-body">
                Prolonged eyelid closure identified below safety threshold (0.20 EAR).
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-critical text-bg font-bold uppercase shrink-0">
            AUDITORY ALARM ARMED
          </span>
        </div>
      ) : isDistracted ? (
        <div className="p-3 rounded-md bg-warning-subtle border border-warning text-warning flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold tracking-wider uppercase block">
                ATTENTION WARNING
              </span>
              <span className="text-[11px] text-text-secondary font-body">
                Visible signs of reduced attention detected. Gaze deviated from roadway corridor.
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-warning text-bg font-bold uppercase shrink-0">
            ADVISORY
          </span>
        </div>
      ) : null}

      {/* Main Grid: Left Infrared Camera Viewport (60%) + Right Telemetry Panel (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Large Driver Camera Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="relative w-full aspect-[16/10] bg-[#02070D] rounded-lg overflow-hidden border border-border flex items-center justify-center">
            {/* Near-Infrared Camera Simulation Art */}
            <svg className="w-full h-full" viewBox="0 0 600 380">
              <defs>
                <radialGradient id="irGazeGlow" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="rgba(77, 142, 255, 0.12)" />
                  <stop offset="100%" stopColor="rgba(2, 7, 13, 0)" />
                </radialGradient>
              </defs>

              <rect width="600" height="380" fill="url(#irGazeGlow)" />

              {/* Cabin interior subtle silhouettes */}
              <path
                d="M 60 380 L 140 240 L 460 240 L 540 380 Z"
                fill="none"
                stroke="rgba(141, 184, 255, 0.1)"
                strokeWidth="1"
              />
              <circle cx="300" cy="180" r="110" fill="none" stroke="rgba(141, 184, 255, 0.12)" strokeDasharray="3 3" />

              {/* Stylized Driver Head & Mesh representation */}
              <g transform={`translate(${gazeX * 0.4}, ${gazeY * 0.3})`}>
                {/* Head Oval */}
                <ellipse
                  cx="300"
                  cy="170"
                  rx="68"
                  ry="88"
                  fill="none"
                  stroke={isDrowsy ? '#FF5C67' : isDistracted ? '#F5B942' : 'rgba(141, 184, 255, 0.5)'}
                  strokeWidth="1.5"
                />

                {/* Eyes Level */}
                {driverStatus.eyes_closed ? (
                  // Closed Eyelid lines
                  <>
                    <line x1="270" y1="155" x2="288" y2="155" stroke="#FF5C67" strokeWidth="2.5" />
                    <line x1="312" y1="155" x2="330" y2="155" stroke="#FF5C67" strokeWidth="2.5" />
                  </>
                ) : (
                  // Open Eyes & pupils
                  <>
                    <ellipse cx="279" cy="155" rx="10" ry="6" fill="none" stroke="rgba(141, 184, 255, 0.7)" strokeWidth="1.5" />
                    <circle cx={279 + gazeX * 0.1} cy={155 + gazeY * 0.1} r="3" fill="#8DB8FF" />
                    <ellipse cx="321" cy="155" rx="10" ry="6" fill="none" stroke="rgba(141, 184, 255, 0.7)" strokeWidth="1.5" />
                    <circle cx={321 + gazeX * 0.1} cy={155 + gazeY * 0.1} r="3" fill="#8DB8FF" />
                  </>
                )}

                {/* Nose bridge & Gaze Vector Arrow */}
                <line x1="300" y1="165" x2="300" y2="185" stroke="rgba(141, 184, 255, 0.4)" strokeWidth="1" />
                <line
                  x1="300"
                  y1="175"
                  x2={300 + gazeX * 1.5}
                  y2={175 + gazeY * 1.5}
                  stroke={isDistracted ? '#F5B942' : '#35D69A'}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <circle cx={300 + gazeX * 1.5} cy={175 + gazeY * 1.5} r="3.5" fill={isDistracted ? '#F5B942' : '#35D69A'} />
              </g>

              {/* Optical Crop Corner Reticles */}
              <path d="M 30 50 L 30 30 L 50 30" stroke="rgba(141, 184, 255, 0.4)" strokeWidth="1.5" fill="none" />
              <path d="M 570 50 L 570 30 L 550 30" stroke="rgba(141, 184, 255, 0.4)" strokeWidth="1.5" fill="none" />
              <path d="M 30 330 L 30 350 L 50 350" stroke="rgba(141, 184, 255, 0.4)" strokeWidth="1.5" fill="none" />
              <path d="M 570 330 L 570 350 L 550 350" stroke="rgba(141, 184, 255, 0.4)" strokeWidth="1.5" fill="none" />
            </svg>

            {/* Top Overlay Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[11px] bg-surface/90 px-2.5 py-1 rounded border border-border backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-success status-pulse" />
              <span className="text-text-primary font-bold">NIR CABIN STREAM</span>
              <span className="text-text-muted">// 850nm ILLUMINATOR</span>
            </div>
          </div>
        </div>

        {/* Right Telemetry Panel */}
        <div className="lg:col-span-5 surface-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="telemetry-label text-[10px]">TELEMETRY OBSERVATIONS</span>
            <span className="font-mono text-xs text-text-muted">ISO 26262 ASIL-B</span>
          </div>

          {/* Core Metric 1: ATTENTION */}
          <div className="surface-inset p-3 flex items-center justify-between font-mono">
            <div>
              <span className="telemetry-label text-[9px]">ATTENTION</span>
              <div
                className={`font-headline font-bold text-base mt-0.5 ${
                  isAttentive ? 'text-success' : isDrowsy ? 'text-critical' : 'text-warning'
                }`}
              >
                {driverStatus.state.replace(/_/g, ' ')}
              </div>
            </div>
            <span className="text-xs text-text-muted">
              CONF: {(driverStatus.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Core Metric 2: EYES */}
          <div className="surface-inset p-3 space-y-2 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="telemetry-label text-[9px]">EYES</span>
                <div className="font-headline font-bold text-sm text-text-primary mt-0.5">
                  {driverStatus.eyes_closed ? 'CLOSED (ALERT)' : 'OPEN & FIXATED'}
                </div>
              </div>
              <span
                className={`font-bold text-sm ${
                  driverStatus.ear_average < 0.20 ? 'text-critical' : 'text-text-primary'
                }`}
              >
                EAR: {driverStatus.ear_average.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden relative">
              <div
                className={`h-full transition-all duration-200 ${
                  driverStatus.ear_average < 0.20 ? 'bg-critical' : 'bg-success'
                }`}
                style={{ width: `${earPercent}%` }}
              />
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-warning" />
            </div>
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>CLOSURE THRESHOLD: 0.20</span>
              <span>NOMINAL: 0.32</span>
            </div>
          </div>

          {/* Core Metric 3: HEAD */}
          <div className="surface-inset p-3 space-y-1 font-mono text-xs">
            <span className="telemetry-label text-[9px] block">HEAD POSE (EULER ANGLES)</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="surface p-2 rounded text-center">
                <span className="text-[10px] text-text-muted block">PITCH</span>
                <span className="font-bold text-text-primary">{safeHeadPose.pitch.toFixed(1)}°</span>
              </div>
              <div className="surface p-2 rounded text-center">
                <span className="text-[10px] text-text-muted block">YAW</span>
                <span className="font-bold text-text-primary">{safeHeadPose.yaw.toFixed(1)}°</span>
              </div>
              <div className="surface p-2 rounded text-center">
                <span className="text-[10px] text-text-muted block">ROLL</span>
                <span className="font-bold text-text-primary">{safeHeadPose.roll.toFixed(1)}°</span>
              </div>
            </div>
          </div>

          {/* Core Metric 4: MONITOR */}
          <div className="surface-inset p-3 flex items-center justify-between font-mono text-xs">
            <span className="text-text-muted">MONITOR SUBSYSTEM:</span>
            <span className="text-success font-bold">ACTIVE &amp; TRACKING</span>
          </div>

          {/* Medical Disclaimer Note */}
          <div className="p-2.5 rounded bg-surface border border-border-subtle text-[11px] text-text-muted font-body leading-relaxed">
            <strong className="text-text-secondary block mb-0.5 font-headline">Safety Advisory Notice:</strong>
            Driver monitoring assesses visual behavioral proxies (eyelid aspect ratio &amp; head pose) for situational awareness. It is not intended for clinical, medical, or diagnostic evaluation.
          </div>
        </div>
      </div>
    </div>
  );
};
