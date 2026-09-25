import React from 'react';
import type { DriverStatus, DriverState, SafetyEvent } from '../types';

interface DriverMonitoringPageProps {
  driverStatus: DriverStatus;
  onSimulateState: (state: DriverState) => void;
  events: SafetyEvent[];
}

export const DriverMonitoringPage: React.FC<DriverMonitoringPageProps> = ({
  driverStatus,
  onSimulateState,
  events,
}) => {
  const isDrowsy = driverStatus.state === 'DROWSINESS_WARNING';
  const isDistracted = driverStatus.state === 'ATTENTION_WARNING';
  const isAttentive = driverStatus.state === 'ATTENTIVE';

  // Calculate gaze vector coordinates
  const yaw = driverStatus.head_pose.yaw;
  const pitch = driverStatus.head_pose.pitch;

  // Gaze line target in SVG
  const arrowX = 100 + yaw * 1.5;
  const arrowY = 35 + pitch * 1.2;

  // Filter DMS specific events
  const dmsEvents = events.filter((e) => e.source === 'DRIVER_MONITOR');

  return (
    <div className="flex flex-col w-full p-space-md lg:p-space-lg space-y-space-md text-on-surface max-w-[1720px] mx-auto">
      {/* Top Header & Status Bar with Simulation Switchers */}
      <section className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-lg border border-outline-variant/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[28px]">face_6</span>
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-tertiary">OPTICAL ADAS CORE // CH-4</span>
                <span className="text-outline text-[10px]">/</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant">NEAR-INFRARED DMS</span>
              </div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                Driver Awareness Monitoring System (IR DMS)
              </h1>
            </div>
          </div>

          {/* State Indicator Pill & Switcher */}
          <div className="flex flex-wrap items-center gap-space-sm bg-surface-container-lowest p-space-xs rounded-xl shadow-inner border border-outline-variant/20">
            <div
              className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-lg transition-all duration-300 ${
                isAttentive
                  ? 'bg-tertiary/10 text-tertiary'
                  : isDrowsy
                  ? 'bg-error-container text-on-error-container animate-pulse'
                  : 'bg-secondary/20 text-secondary'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAttentive ? 'bg-tertiary animate-ping' : isDrowsy ? 'bg-error animate-ping' : 'bg-secondary'
                }`}
              />
              <span className="font-label-caps text-label-caps tracking-widest font-bold">
                {driverStatus.state}
              </span>
            </div>

            <div className="h-6 w-px bg-surface-container-high hidden sm:block" />

            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="font-label-caps text-[10px] text-outline uppercase pl-space-xs">Simulate:</span>
              <button
                type="button"
                onClick={() => onSimulateState('ATTENTIVE')}
                className={`px-2 py-1 rounded font-label-caps text-[10px] transition-colors ${
                  isAttentive ? 'bg-tertiary text-on-tertiary font-bold' : 'hover:bg-surface-container-high text-tertiary'
                }`}
              >
                Safe
              </button>
              <button
                type="button"
                onClick={() => onSimulateState('ATTENTION_WARNING')}
                className={`px-2 py-1 rounded font-label-caps text-[10px] transition-colors ${
                  isDistracted
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'hover:bg-surface-container-high text-secondary'
                }`}
              >
                Distracted
              </button>
              <button
                type="button"
                onClick={() => onSimulateState('DROWSINESS_WARNING')}
                className={`px-2 py-1 rounded font-label-caps text-[10px] transition-colors ${
                  isDrowsy ? 'bg-error text-on-error font-bold' : 'hover:bg-surface-container-high text-error'
                }`}
              >
                Drowsy
              </button>
              <button
                type="button"
                onClick={() => onSimulateState('FACE_NOT_DETECTED')}
                className="px-2 py-1 rounded font-label-caps text-[10px] hover:bg-surface-container-high text-outline transition-colors"
              >
                No Face
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Product Safety Disclaimer Notice */}
        <div className="flex items-start gap-space-sm bg-surface-container-highest/60 px-space-md py-space-sm rounded-lg text-on-surface-variant border border-outline-variant/10">
          <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
            verified_user
          </span>
          <p className="font-body-sm text-[12px] leading-tight">
            <strong className="font-semibold text-primary">Notice:</strong> RoadGuard AI monitors visible
            facial, gaze, and posture cues to assist driver awareness. This system does not diagnose medical
            conditions, cognitive impairments, or neurological fatigue disorders.
          </p>
        </div>
      </section>

      {/* Main Split Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-start">
        {/* Left: High-Tech Interior IR Camera Feed (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-xl border border-outline-variant/20">
          <div className="relative w-full aspect-[16/10] bg-surface-container-lowest rounded-lg overflow-hidden group">
            {/* Visual scanlines & cabin ambient background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-surface-container-lowest/80 to-background/60 pointer-events-none" />
            <div className="tactical-grid absolute inset-0 opacity-40 pointer-events-none" />

            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/60" />

            {/* Top Peripheral HUD Sensor Status Flags */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-space-xs bg-surface/80 backdrop-blur-md px-space-sm py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                <span className="font-label-caps text-[10px] text-on-surface">IR SENSOR: 940nm OPTIMAL</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-[10px] bg-surface-container-high/80 backdrop-blur-md text-primary px-space-xs py-1 rounded">
                  POLARIZER: ON
                </span>
                <span className="font-label-caps text-[10px] bg-surface-container-high/80 backdrop-blur-md text-tertiary px-space-xs py-1 rounded">
                  LENS CLEAR
                </span>
                <span className="font-label-caps text-[10px] bg-surface-container-high/80 backdrop-blur-md text-on-surface-variant px-space-xs py-1 rounded">
                  FRAME: 1080p @ 60FPS
                </span>
              </div>
            </div>

            {/* Facial Landmark Bounding Box Overlay & SVG Vector Graphics */}
            <div
              className={`absolute inset-[18%_25%_18%_25%] border rounded-lg flex flex-col justify-between p-2 transition-all duration-300 ${
                isDrowsy
                  ? 'border-error bg-error/10 shadow-[0_0_25px_rgba(255,180,171,0.3)]'
                  : isDistracted
                  ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_rgba(208,188,255,0.2)]'
                  : 'border-primary/70 bg-primary/5 shadow-[0_0_15px_rgba(77,142,255,0.15)]'
              }`}
            >
              {/* Bounding Metadata Header */}
              <div className="flex items-center justify-between -mt-6">
                <span
                  className={`font-label-caps text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold ${
                    isDrowsy
                      ? 'bg-error text-on-error'
                      : isDistracted
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-primary-container text-on-primary-container'
                  }`}
                >
                  FACE_ID: DRIVER_PRIMARY ({(driverStatus.confidence * 100).toFixed(1)}%)
                </span>
                <span className="font-label-caps text-[9px] text-primary/80 bg-surface-container-lowest/80 px-1 rounded">
                  FOV LOCK: 0.14ms
                </span>
              </div>

              {/* Landmark Mesh Overlay (SVG) */}
              <svg className="absolute inset-0 w-full h-full opacity-80" viewBox="0 0 200 200" fill="none">
                {/* Gaze Vector Arrow */}
                <line
                  x1="100"
                  y1="85"
                  x2={arrowX}
                  y2={arrowY}
                  stroke={isDrowsy ? '#ffb4ab' : isDistracted ? '#d0bcff' : '#4edea3'}
                  strokeWidth="2.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={arrowX}
                  cy={arrowY}
                  r="4"
                  fill={isDrowsy ? '#ffb4ab' : isDistracted ? '#d0bcff' : '#4edea3'}
                />

                {/* Left Eye */}
                <circle
                  cx="72"
                  cy="84"
                  r={driverStatus.eyes_closed ? 1.5 : 4}
                  stroke={isDrowsy ? '#ffb4ab' : '#4edea3'}
                  strokeWidth="1.5"
                  fill={driverStatus.eyes_closed ? '#ffb4ab' : 'none'}
                />
                <circle cx="85" cy="76" r="2" fill="#adc6ff" />
                <circle cx="58" cy="80" r="2" fill="#adc6ff" />

                {/* Right Eye */}
                <circle
                  cx="128"
                  cy="84"
                  r={driverStatus.eyes_closed ? 1.5 : 4}
                  stroke={isDrowsy ? '#ffb4ab' : '#4edea3'}
                  strokeWidth="1.5"
                  fill={driverStatus.eyes_closed ? '#ffb4ab' : 'none'}
                />
                <circle cx="115" cy="76" r="2" fill="#adc6ff" />
                <circle cx="142" cy="80" r="2" fill="#adc6ff" />

                {/* Nose Bridge */}
                <polyline
                  points="100,75 100,105 92,112 108,112"
                  stroke="#adc6ff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Mouth Outline */}
                <path
                  d="M80 135 Q100 145 120 135"
                  stroke={isDrowsy ? '#ffb4ab' : '#adc6ff'}
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>

              {/* Bottom tag */}
              <div className="flex justify-between items-end text-[9px] font-mono text-outline">
                <span>PITCH: {pitch.toFixed(1)}°</span>
                <span>YAW: {yaw.toFixed(1)}°</span>
              </div>
            </div>

            {/* Bottom HUD info */}
            <div className="absolute bottom-3 left-4 right-4 flex justify-between font-label-caps text-[10px] text-outline pointer-events-none">
              <span>IR EMITTER: CONTINUOUS 940NM</span>
              <span>MEDIAN FILTER: APPLIED</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry Metrics Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-sm">
          {/* Eye Aspect Ratio Card */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-md">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Eye Aspect Ratio (EAR) Gauge
              </span>
              <span
                className={`font-label-caps text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  driverStatus.ear_average >= 0.20
                    ? 'bg-tertiary/20 text-tertiary'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                {driverStatus.ear_average >= 0.20 ? 'EYES OPEN' : 'EYES CLOSED / DROWSY'}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <span
                className={`font-telemetry-display text-[32px] font-bold ${
                  driverStatus.ear_average >= 0.20 ? 'text-tertiary' : 'text-error'
                }`}
              >
                {driverStatus.ear_average.toFixed(2)}
              </span>
              <span className="font-body-sm text-[11px] text-outline">
                CRITICAL THRESHOLD: &lt; 0.20
              </span>
            </div>

            {/* Visual EAR Bar */}
            <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden mt-2 relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  driverStatus.ear_average >= 0.20 ? 'bg-tertiary' : 'bg-error'
                }`}
                style={{ width: `${Math.min(100, (driverStatus.ear_average / 0.40) * 100)}%` }}
              />
              {/* Threshold line at 0.20 (50%) */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-error" />
            </div>

            <div className="flex justify-between font-label-caps text-[9px] text-outline mt-1">
              <span>0.00 (Closed)</span>
              <span className="text-error font-bold">0.20 LIMIT</span>
              <span>0.40 (Wide)</span>
            </div>
          </div>

          {/* Gaze & Head Orientation Bento */}
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-md">
              <span className="font-label-caps text-[10px] text-outline uppercase block">Gaze Direction</span>
              <span
                className={`font-headline-sm text-[16px] font-semibold block mt-1 uppercase ${
                  isAttentive ? 'text-tertiary' : 'text-secondary'
                }`}
              >
                {driverStatus.gaze_direction}
              </span>
              <span className="font-body-sm text-[10px] text-outline mt-1 block">
                Trajectory: {yaw > 12 ? 'Right Drift' : yaw < -12 ? 'Left Drift' : 'Forward Center'}
              </span>
            </div>

            <div className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-md">
              <span className="font-label-caps text-[10px] text-outline uppercase block">Head Orientation</span>
              <div className="font-telemetry-display text-[15px] text-on-surface font-bold mt-1">
                Y: {yaw.toFixed(1)}° | P: {pitch.toFixed(1)}°
              </div>
              <span className="font-body-sm text-[10px] text-tertiary mt-1 block">
                Euler Angles Normal
              </span>
            </div>
          </div>

          {/* Fatigue & Incident Audit Log */}
          <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-md">
            <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/10 mb-space-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                Cabin Safety Incident Log
              </span>
              <span className="font-label-caps text-[10px] text-primary">{dmsEvents.length} Recorded</span>
            </div>

            {dmsEvents.length === 0 ? (
              <div className="py-4 text-center text-outline font-body-sm text-[12px]">
                No driver attention alerts recorded in active session.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dmsEvents.slice(0, 4).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-1.5 rounded bg-surface-container text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ev.category === 'CRITICAL' ? 'bg-error' : 'bg-secondary'
                        }`}
                      />
                      <span className="font-semibold text-on-surface truncate">{ev.title}</span>
                    </div>
                    <span className="font-label-caps text-[9px] text-outline shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
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
