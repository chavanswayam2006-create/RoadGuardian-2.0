import React from 'react';
import type { Detection, DriverStatus, RoadContext, Garage, SafetyEvent, NavRoute } from '../types';

interface DashboardPageProps {
  currentSpeedKmh: number;
  speedLimitKmh: number;
  onSpeedChange: (speed: number) => void;
  onSpeedLimitChange: (limit: number) => void;
  detections: Detection[];
  inferenceTimeMs: number;
  driverStatus: DriverStatus;
  roadContext: RoadContext | null;
  garages: Garage[];
  events: SafetyEvent[];
  onNavigate: (route: NavRoute) => void;
  isBackendConnected: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentSpeedKmh,
  speedLimitKmh,
  onSpeedChange,
  onSpeedLimitChange,
  detections,
  inferenceTimeMs,
  driverStatus,
  roadContext,
  garages,
  events,
  onNavigate,
  isBackendConnected,
}) => {
  const speedMargin = currentSpeedKmh - speedLimitKmh;
  const isOverSpeed = speedMargin > 0;

  // 314.15 is full circle circumference for r=66, map 0-140 km/h
  const maxCircumference = 314.15;
  const clampedSpeed = Math.min(140, Math.max(0, currentSpeedKmh));
  const offset = maxCircumference - (clampedSpeed / 140) * (maxCircumference * 0.7);

  // Latest detected sign
  const latestSign = detections[0] || {
    class_name: 'Speed limit (50km/h)',
    confidence: 0.98,
    speed_limit_kmh: 50,
    is_red_light: false,
  };

  const nearestGarage = garages[0] || {
    name: 'AutoService Schwabing Nord',
    distance_meters: 650,
  };

  return (
    <div className="p-margin-md flex flex-col gap-space-lg max-w-[1720px] mx-auto w-full">
      {/* Top Mission Header & Telematics Pulse */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-md border border-outline-variant/20">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary shadow-sm">
            <span className="material-symbols-outlined text-[28px]">speed</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-tertiary tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                SESSION ACTIVE
              </span>
              <span className="text-outline-variant text-[10px]">•</span>
              <span className="font-label-caps text-label-caps uppercase text-primary">
                {roadContext?.road_name ? roadContext.road_name.toUpperCase() : 'URBAN CORRIDOR ROUTE 101'}
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm text-on-surface">
              Executive Telematics &amp; Safety Vector
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="px-space-sm py-space-xs bg-surface-container rounded-lg flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps text-outline uppercase">AI Latency</span>
            <span className="font-telemetry-display text-[15px] font-bold text-tertiary">
              {inferenceTimeMs.toFixed(1)} ms
            </span>
          </div>
          <div className="px-space-sm py-space-xs bg-surface-container rounded-lg flex items-center gap-space-xs">
            <span className="font-label-caps text-label-caps text-outline uppercase">Safety Envelope</span>
            <span
              className={`font-label-caps text-label-caps px-2 py-0.5 rounded font-bold ${
                isOverSpeed
                  ? 'bg-error-container/30 text-error'
                  : 'bg-tertiary/10 text-tertiary'
              }`}
            >
              {isOverSpeed ? 'OVER LIMIT' : 'OPTIMAL'}
            </span>
          </div>
          <button
            onClick={() => onSpeedChange(Math.floor(Math.random() * 20) + 42)}
            className="px-space-sm py-space-xs bg-surface-container-high hover:bg-surface-variant text-primary font-label-caps text-label-caps rounded-lg transition-colors flex items-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>CALIBRATE TELEMETRY</span>
          </button>
        </div>
      </div>

      {/* Hero Velocity & Real-time Context Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Speedometer & Vector Card */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-outline-variant/20">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-space-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isOverSpeed ? 'bg-error animate-ping' : 'bg-tertiary'}`} />
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">
                PRIMARY VELOCITY STABILIZER
              </span>
            </div>
            <span
              className={`font-label-caps text-label-caps px-space-sm py-1 rounded-full flex items-center gap-1 ${
                isOverSpeed
                  ? 'bg-error-container/40 text-error font-bold'
                  : 'bg-surface-container text-tertiary'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isOverSpeed ? 'warning' : 'verified'}
              </span>
              {isOverSpeed
                ? `ALERT: +${speedMargin.toFixed(0)} KM/H ABOVE POSTED CEILING`
                : `COMPLIANT: ${Math.abs(speedMargin).toFixed(0)} KM/H BELOW CEILING`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg items-center my-space-md z-10">
            {/* Radial Gauge Visualization */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                  {/* Background Arc */}
                  <circle
                    className="text-surface-variant fill-none"
                    cx="80"
                    cy="80"
                    r="66"
                    stroke="currentColor"
                    strokeDasharray="314.15"
                    strokeDashoffset="62.8"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  {/* Speed Limit Target Arc */}
                  <circle
                    className="text-primary-container/40 fill-none"
                    cx="80"
                    cy="80"
                    r="66"
                    stroke="currentColor"
                    strokeDasharray="314.15"
                    strokeDashoffset="130"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  {/* Current Velocity Arc */}
                  <circle
                    className={`fill-none transition-all duration-500 ease-out ${
                      isOverSpeed ? 'text-error' : 'text-tertiary'
                    }`}
                    cx="80"
                    cy="80"
                    r="66"
                    stroke="currentColor"
                    strokeDasharray="314.15"
                    strokeDashoffset={offset.toFixed(1)}
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                    SPEED
                  </span>
                  <div className="flex items-baseline">
                    <span
                      className={`font-telemetry-display text-[46px] font-bold leading-none tracking-tight ${
                        isOverSpeed ? 'text-error' : 'text-on-surface'
                      }`}
                    >
                      {Math.round(currentSpeedKmh)}
                    </span>
                    <span className="font-telemetry-unit text-telemetry-unit text-outline ml-1">
                      km/h
                    </span>
                  </div>
                  <span
                    className={`font-label-caps text-[10px] font-semibold tracking-wide ${
                      isOverSpeed ? 'text-error' : 'text-tertiary'
                    }`}
                  >
                    {isOverSpeed ? 'SPEED ALERT' : 'ECO CRUISE'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-center mt-space-xs">
                <span className="font-label-caps text-label-caps text-outline">MIN 0</span>
                <span className="font-label-caps text-label-caps text-primary font-bold">
                  POSTED {speedLimitKmh}
                </span>
                <span className="font-label-caps text-label-caps text-outline">MAX 140</span>
              </div>
            </div>

            {/* Speed Diagnostics & Margin breakdown */}
            <div className="md:col-span-7 flex flex-col gap-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm bg-surface-container rounded-lg flex flex-col">
                  <span className="font-label-caps text-label-caps text-outline uppercase">
                    Detected Limit
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {speedLimitKmh} <span className="font-telemetry-unit text-body-sm text-outline">km/h</span>
                    </span>
                    <div className="w-8 h-8 rounded-full bg-error-container text-on-error flex items-center justify-center font-headline-sm text-[13px] font-black border-2 border-on-error">
                      {speedLimitKmh}
                    </div>
                  </div>
                  <span className="font-body-sm text-[11px] text-tertiary mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    Camera Verified (98%)
                  </span>
                </div>

                <div className="p-space-sm bg-surface-container rounded-lg flex flex-col">
                  <span className="font-label-caps text-label-caps text-outline uppercase">
                    Speed Margin
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className={`font-headline-sm text-headline-sm font-semibold ${
                        isOverSpeed ? 'text-error' : 'text-tertiary'
                      }`}
                    >
                      {speedMargin >= 0 ? `+${speedMargin.toFixed(1)}` : speedMargin.toFixed(1)}{' '}
                      <span className="font-telemetry-unit text-body-sm text-outline">km/h</span>
                    </span>
                    <span
                      className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded uppercase ${
                        isOverSpeed ? 'bg-error/20 text-error' : 'bg-tertiary/20 text-tertiary'
                      }`}
                    >
                      {isOverSpeed ? 'OVER LIMIT' : 'SAFE BUFFER'}
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                    {isOverSpeed ? 'Deceleration advisory armed' : 'No deceleration required'}
                  </span>
                </div>
              </div>

              {/* Dynamic Bar indicator */}
              <div className="p-space-sm bg-surface-container rounded-lg flex flex-col gap-space-xs">
                <div className="flex items-center justify-between font-label-caps text-label-caps">
                  <span className="text-on-surface-variant uppercase">Acceleration Load Gradient</span>
                  <span className="text-primary font-mono">+0.12 G (Optimal)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverSpeed ? 'bg-error' : 'bg-tertiary'
                    }`}
                    style={{ width: `${Math.min(100, (clampedSpeed / 140) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between font-label-caps text-[10px] text-outline">
                  <span>Deceleration Zone</span>
                  <span>Cruising Envelope</span>
                  <span>Over-limit Alert</span>
                </div>
              </div>

              {/* Interactive Speed Bench adjustment controls */}
              <div className="p-space-xs bg-surface-container/60 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-caps text-[10px] text-outline uppercase">Speed:</span>
                  <button
                    onClick={() => onSpeedChange(Math.max(0, currentSpeedKmh - 5))}
                    className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-caps text-[10px]"
                  >
                    -5 KM/H
                  </button>
                  <button
                    onClick={() => onSpeedChange(currentSpeedKmh + 5)}
                    className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-caps text-[10px]"
                  >
                    +5 KM/H
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-label-caps text-[10px] text-outline uppercase">Limit:</span>
                  {[30, 50, 70, 100].map((l) => (
                    <button
                      key={l}
                      onClick={() => onSpeedLimitChange(l)}
                      className={`px-1.5 py-0.5 rounded font-label-caps text-[10px] transition-colors ${
                        speedLimitKmh === l
                          ? 'bg-error text-on-error font-bold'
                          : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Banner callout inline */}
          <div className="z-10 p-space-sm bg-surface-container rounded-lg flex items-center gap-space-sm text-on-surface">
            <div className="p-space-xs rounded bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body-sm text-body-sm text-on-surface font-medium truncate">
                Speed Limit {speedLimitKmh} km/h confirmed ahead. Forward road corridor analyzed.
              </p>
            </div>
            <span className="font-label-caps text-[10px] text-outline whitespace-nowrap">
              REFRESHED 0.4s AGO
            </span>
          </div>
        </div>

        {/* Quick Operations Command Tower */}
        <div className="lg:col-span-4 flex flex-col gap-space-sm">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex-1 flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                COMMAND SHORTCUTS
              </span>
              <span className="font-label-caps text-[10px] text-tertiary">PILOT READY</span>
            </div>

            <div className="grid grid-cols-1 gap-space-sm">
              {/* Action 1: Live Detection */}
              <button
                onClick={() => onNavigate('detection')}
                className="w-full p-space-sm rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary transition-all duration-200 flex items-center justify-between group shadow-sm text-left"
              >
                <div className="flex items-center gap-space-sm">
                  <div className="p-2 rounded bg-on-primary-container/10 text-on-primary-container group-hover:bg-on-primary/10 group-hover:text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">videocam</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[15px] font-semibold leading-tight">
                      Open Live Detection
                    </span>
                    <span className="font-body-sm text-[12px] opacity-80">
                      HUD bounding vectors @ 30 FPS
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>

              {/* Action 2: Driver Monitoring */}
              <button
                onClick={() => onNavigate('driver-monitoring')}
                className="w-full p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all duration-200 flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-space-sm">
                  <div className="p-2 rounded bg-surface-variant text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">visibility</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-[15px] font-semibold leading-tight">
                        Driver Monitoring
                      </span>
                      <span
                        className={`font-label-caps text-[9px] px-1 rounded ${
                          driverStatus.state === 'ATTENTIVE'
                            ? 'bg-tertiary/20 text-tertiary'
                            : 'bg-error/20 text-error'
                        }`}
                      >
                        {driverStatus.state}
                      </span>
                    </div>
                    <span className="font-body-sm text-[12px] text-outline">
                      Cabin infrared gaze analyzer
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-outline transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>

              {/* Action 3: Road Map */}
              <button
                onClick={() => onNavigate('map')}
                className="w-full p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all duration-200 flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-space-sm">
                  <div className="p-2 rounded bg-surface-variant text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">explore</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[15px] font-semibold leading-tight">
                      Open Road Map
                    </span>
                    <span className="font-body-sm text-[12px] text-outline">
                      Vector corridor &amp; garage triage
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-outline transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>

              {/* Action 4: Detection History */}
              <button
                onClick={() => onNavigate('history')}
                className="w-full p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all duration-200 flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-space-sm">
                  <div className="p-2 rounded bg-surface-variant text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">history</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-[15px] font-semibold leading-tight">
                      View Detection History
                    </span>
                    <span className="font-body-sm text-[12px] text-outline">
                      Audit log of {events.length} logged incidents
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[20px] text-outline transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Four Primary Telemetry & Awareness Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
        {/* Card 1: Latest Detected Sign & Light */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col justify-between hover:bg-surface-container/60 transition-colors border border-outline-variant/20">
          <div>
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                SIGNAL AWARENESS
              </span>
              <span className="font-label-caps text-label-caps text-tertiary">1.2s AGO</span>
            </div>
            <div className="p-space-sm bg-surface-container rounded-lg my-space-sm flex items-center gap-space-md">
              <div className="relative w-14 h-14 rounded-full bg-surface flex items-center justify-center shadow-inner flex-shrink-0">
                <div className="w-12 h-12 rounded-full border-4 border-error flex items-center justify-center bg-inverse-surface text-surface font-headline-xl text-[20px] font-black">
                  {latestSign.speed_limit_kmh || speedLimitKmh}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-[15px] font-semibold text-on-surface truncate">
                    {latestSign.class_name}
                  </span>
                  <span className="font-label-caps text-[10px] bg-tertiary-container/30 text-tertiary px-1.5 py-0.5 rounded">
                    {Math.round(latestSign.confidence * 100)}% CONF
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-3 h-3 rounded-full bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.8)]" />
                  <span className="font-body-sm text-body-sm text-tertiary font-medium">
                    TRAFFIC LIGHT: GREEN
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-space-xs">
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              Maintain current cruising velocity. Intersection is clear with green priority phase.
            </p>
          </div>
        </div>

        {/* Card 2: Driver Attention Status */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col justify-between hover:bg-surface-container/60 transition-colors border border-outline-variant/20">
          <div>
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                IR DRIVER MONITOR
              </span>
              <span className="font-label-caps text-label-caps text-tertiary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> ACTIVE
              </span>
            </div>
            <div className="p-space-sm bg-surface-container rounded-lg my-space-sm flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">eye_tracking</span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`font-headline-sm text-[16px] font-semibold ${
                      driverStatus.state === 'ATTENTIVE' ? 'text-tertiary' : 'text-error'
                    }`}
                  >
                    {driverStatus.state}
                  </span>
                  <span className="font-body-sm text-[12px] text-outline">Awareness Metric</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-telemetry-display text-[26px] text-tertiary font-bold">
                  {Math.round(driverStatus.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-label-caps text-label-caps text-outline">
              <span>Eye Aspect Ratio (EAR)</span>
              <span className="text-on-surface font-mono">{driverStatus.ear_average.toFixed(2)} / 0.20</span>
            </div>
            <div className="flex items-center justify-between font-label-caps text-label-caps text-outline">
              <span>Road Gaze Vector</span>
              <span className="text-tertiary uppercase font-mono">{driverStatus.gaze_direction}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Live Camera Feed Mini-Preview */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col justify-between hover:bg-surface-container/60 transition-colors border border-outline-variant/20">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              FRONT CAM TELEMETRY
            </span>
            <span className="font-label-caps text-label-caps bg-surface-container text-tertiary px-1.5 py-0.5 rounded">
              30 FPS
            </span>
          </div>
          {/* Simulated HUD feed graphic */}
          <div className="relative w-full h-32 my-space-xs rounded-lg overflow-hidden bg-surface-container-lowest border border-outline-variant/20">
            <div className="w-full h-full bg-gradient-to-b from-surface-container-high/40 to-surface-container-lowest flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-primary/40">videocam</span>
            </div>
            <div className="absolute inset-0 p-2 flex flex-col justify-between pointer-events-none">
              <div className="flex justify-between text-[10px] text-outline font-mono">
                <span>FOV: 120°</span>
                <span>1080P_HDR</span>
              </div>
              <div className="flex justify-between text-[10px] text-outline font-mono">
                <span>EXP: AUTO</span>
                <span>YOLO_GTSRB</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('detection')}
            className="w-full py-1.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-caps text-label-caps uppercase rounded transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            <span>Expand Live Detection</span>
          </button>
        </div>

        {/* Card 4: GPS & Road Context Preview */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col justify-between hover:bg-surface-container/60 transition-colors border border-outline-variant/20">
          <div className="flex items-center justify-between pb-space-xs">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
              ROAD CONTEXT &amp; GPS
            </span>
            <span className="font-label-caps text-label-caps text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">near_me</span> LOCK
            </span>
          </div>
          <div className="relative w-full h-32 my-space-xs rounded-lg overflow-hidden bg-surface-container-lowest p-3 flex flex-col justify-between border border-outline-variant/20">
            <div>
              <span className="font-label-caps text-[10px] text-outline uppercase block">Current Road</span>
              <span className="font-headline-sm text-[14px] text-on-surface font-semibold truncate block">
                {roadContext?.road_name || 'Leopoldstraße / A99'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <div className="flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-[14px] text-secondary">build</span>
                <span className="truncate">{nearestGarage.name}</span>
              </div>
              <span className="font-label-caps text-[10px] text-outline">
                {nearestGarage.distance_meters}m
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('map')}
            className="w-full py-1.5 bg-surface-container hover:bg-surface-container-high text-primary font-label-caps text-label-caps uppercase rounded transition-colors flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Open Full Map</span>
          </button>
        </div>
      </div>

      {/* Bottom Detailed Telemetry & Event Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
        {/* Recent Detection Stream */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col border border-outline-variant/20">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">dynamic_feed</span>
              <span className="font-headline-sm text-[16px] font-semibold text-on-surface">
                Recent Perception Stream
              </span>
            </div>
            <span className="font-label-caps text-label-caps text-outline uppercase">
              LAST LOGGED TELEMETRY EVENTS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm flex-1">
            {events.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="p-space-sm bg-surface-container rounded-lg flex items-center justify-between border border-outline-variant/10"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <div
                    className={`w-10 h-10 rounded flex items-center justify-center font-bold text-[12px] flex-shrink-0 ${
                      ev.category === 'CRITICAL'
                        ? 'bg-error-container text-on-error'
                        : ev.category === 'WARNING'
                        ? 'bg-secondary-container/40 text-secondary'
                        : 'bg-primary-container/20 text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {ev.source === 'DRIVER_MONITOR'
                        ? 'visibility'
                        : ev.source === 'ROAD_CONTEXT'
                        ? 'speed'
                        : 'traffic'}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-[13px] font-semibold text-on-surface truncate">
                      {ev.title}
                    </span>
                    <span className="font-body-sm text-[11px] text-outline truncate">{ev.message}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span
                    className={`font-label-caps text-[10px] ${
                      ev.category === 'CRITICAL'
                        ? 'text-error'
                        : ev.category === 'WARNING'
                        ? 'text-secondary'
                        : 'text-tertiary'
                    }`}
                  >
                    {ev.category}
                  </span>
                  <div className="font-label-caps text-[9px] text-outline">
                    {new Date(ev.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edge Compute Hardware Vital Metrics */}
        <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col justify-between border border-outline-variant/20">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">memory</span>
              <span className="font-headline-sm text-[16px] font-semibold text-on-surface">
                System Health Snapshot
              </span>
            </div>
            <span
              className={`font-label-caps text-[10px] px-1.5 py-0.5 rounded font-bold ${
                isBackendConnected
                  ? 'bg-tertiary/10 text-tertiary'
                  : 'bg-error-container/30 text-error'
              }`}
            >
              {isBackendConnected ? 'ALL CLEAR' : 'STANDALONE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-space-sm">
            <div className="p-space-sm bg-surface-container rounded-lg">
              <span className="font-label-caps text-label-caps text-outline uppercase">AI Latency</span>
              <div className="font-telemetry-display text-[22px] font-bold text-tertiary mt-1">
                {inferenceTimeMs.toFixed(0)}{' '}
                <span className="font-telemetry-unit text-body-sm text-outline">ms</span>
              </div>
              <span className="font-body-sm text-[10px] text-on-surface-variant">YOLO / GTSRB CNN</span>
            </div>

            <div className="p-space-sm bg-surface-container rounded-lg">
              <span className="font-label-caps text-label-caps text-outline uppercase">RAM Load</span>
              <div className="font-telemetry-display text-[22px] font-bold text-primary mt-1">
                38 <span className="font-telemetry-unit text-body-sm text-outline">%</span>
              </div>
              <span className="font-body-sm text-[10px] text-on-surface-variant">3.1 GB / 8.0 GB</span>
            </div>

            <div className="p-space-sm bg-surface-container rounded-lg">
              <span className="font-label-caps text-label-caps text-outline uppercase">Core Temp</span>
              <div className="font-telemetry-display text-[22px] font-bold text-on-surface mt-1">
                44 <span className="font-telemetry-unit text-body-sm text-outline">°C</span>
              </div>
              <span className="font-body-sm text-[10px] text-tertiary">Thermal Nominal</span>
            </div>

            <div className="p-space-sm bg-surface-container rounded-lg">
              <span className="font-label-caps text-label-caps text-outline uppercase">Ring Buffer</span>
              <div className="font-telemetry-display text-[22px] font-bold text-secondary mt-1">
                OK <span className="font-telemetry-unit text-body-sm text-outline">200E</span>
              </div>
              <span className="font-body-sm text-[10px] text-on-surface-variant">
                {events.length} / 200 Evts
              </span>
            </div>
          </div>

          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-[11px] text-outline border-t border-outline-variant/10">
            <span>Firmware: v2.4.11-PROD</span>
            <span className="flex items-center gap-1 text-tertiary font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> SYNCED
            </span>
          </div>
        </div>
      </div>

      {/* Automotive Legal & Safety Disclaimer Banner */}
      <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm border border-outline-variant/20">
        <div className="p-2 bg-surface-container-high rounded text-outline flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px]">shield</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body-sm text-[12px] text-on-surface-variant leading-tight">
            <strong className="text-on-surface font-semibold">Automotive Safety Protocol:</strong>{' '}
            RoadGuard AI is an advanced driver-assistance prototype operating under ISO 26262 functional
            safety guidelines. Always maintain full situational attention, keep hands on the steering
            controls, and obey local traffic regulations.
          </p>
        </div>
        <span className="font-label-caps text-[10px] text-outline whitespace-nowrap hidden sm:inline-block">
          SAE LEVEL 2+ COGNITIVE ASSIST
        </span>
      </div>
    </div>
  );
};
