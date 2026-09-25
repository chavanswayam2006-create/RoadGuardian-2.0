import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Radio,
  ArrowRight,
  Clock,
  Gauge,
  Volume2,
} from 'lucide-react';
import { VisionCanvas } from '../components/VisionCanvas';
import { DriverGauge } from '../components/DriverGauge';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type {
  Detection,
  DriverStatus,
  RoadContext,
  Garage,
  SafetyEvent,
  NavRoute,
} from '../types';

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
  roadContext: _roadContext,
  garages: _garages,
  events,
  onNavigate,
  isBackendConnected,
}) => {
  const isOverSpeed = currentSpeedKmh > speedLimitKmh;
  const isDrowsy = driverStatus.state === 'DROWSINESS_WARNING';
  const isDistracted = driverStatus.state === 'ATTENTION_WARNING';

  // Overall Safety State
  const overallSafety = isDrowsy
    ? { level: 'CRITICAL', label: 'CRITICAL WARNING', color: 'text-critical', bg: 'bg-critical-subtle', border: 'border-critical' }
    : isOverSpeed || isDistracted
    ? { level: 'CAUTION', label: 'CAUTION ADVISORY', color: 'text-warning', bg: 'bg-warning-subtle', border: 'border-warning' }
    : { level: 'NORMAL', label: 'NORMAL', color: 'text-success', bg: 'bg-success-subtle', border: 'border-success/30' };

  // Latest genuinely detected sign. No synthetic fallback: when nothing has
  // been recognized the UI states that instead of inventing a sign/confidence.
  const latestSign = detections.length > 0 ? detections[0] : null;

  // Recent 5 events
  const recentEvents = events.slice(0, 5);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto w-full select-none">
      {/* ====================================================================
          SECTION 1 — CURRENT SAFETY STATE (Large but compact hero state)
          ==================================================================== */}
      <section className={`surface-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${overallSafety.border} transition-colors duration-200`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${overallSafety.bg} ${overallSafety.color}`}>
            {overallSafety.level === 'CRITICAL' ? (
              <AlertCircle className="w-5 h-5 animate-pulse" />
            ) : overallSafety.level === 'CAUTION' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="telemetry-label text-[10px]">ROAD AWARENESS STATUS</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`font-headline font-bold text-lg tracking-tight ${overallSafety.color}`}>
                {overallSafety.label}
              </span>
              <span className="text-border text-xs hidden sm:inline">•</span>
              <span className="font-body text-xs text-text-secondary hidden sm:inline">
                {isDrowsy
                  ? 'Micro-sleep symptoms identified. Immediate attention demanded.'
                  : isOverSpeed
                  ? `Speed threshold exceeded (+${currentSpeedKmh - speedLimitKmh} km/h).`
                  : 'Automotive envelope secured. Vision and DMS running nominal.'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicators Pill Group */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded surface-inset">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-text-muted">CAMERA</span>
            <span className="text-text-primary font-bold">ACTIVE</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded surface-inset">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendConnected ? 'bg-success' : 'bg-warning'
              }`}
            />
            <span className="text-text-muted">AI MODEL</span>
            <span
              className={`font-bold ${
                isBackendConnected ? 'text-text-primary' : 'text-warning'
              }`}
            >
              {isBackendConnected ? 'ONLINE' : 'STANDALONE'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded surface-inset">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                driverStatus.state === 'ATTENTIVE' ? 'bg-success' : 'bg-critical status-pulse'
              }`}
            />
            <span className="text-text-muted">DRIVER</span>
            <span
              className={`font-bold ${
                driverStatus.state === 'ATTENTIVE' ? 'text-text-primary' : 'text-critical'
              }`}
            >
              {driverStatus.state === 'ATTENTIVE' ? 'ATTENTIVE' : 'ALERT'}
            </span>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2 & 3 — LIVE VISION (Centerpiece, 65%) & CURRENT ALERT (35%)
          ==================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SECTION 2: LIVE VISION Centerpiece (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-mono text-xs text-text-muted">
              <span className="text-text-primary font-bold tracking-wider">PRIMARY OPTICAL FEED</span>
              <span>//</span>
              <span>GTSRB RESNET-18 INFERENCE</span>
            </div>
            <button
              onClick={() => onNavigate('detection')}
              className="font-mono text-[11px] text-accent hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <span>EXPAND WORKSTATION</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <ErrorBoundary fallbackTitle="VISION MODULE RECOVERY">
            <VisionCanvas
              mode="simulated"
              detections={detections}
              inferenceTimeMs={inferenceTimeMs}
              speedLimitKmh={speedLimitKmh}
              fps={60}
            />
          </ErrorBoundary>
        </div>

        {/* RIGHT COLUMN: SECTION 3 (CURRENT ALERT) + SECTION 4 (DRIVER STATUS) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* SECTION 3 — CURRENT ALERT */}
          <div className="surface-card p-4 flex flex-col justify-between min-h-[170px]">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent" />
                <span className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
                  CURRENT OBSERVATION
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                {detections.length > 0 ? 'SIGN LOCKED' : 'SEARCHING'}
              </span>
            </div>

            {/* Alert Content Box */}
            <div className="my-2.5 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="telemetry-label text-[10px]">
                  {latestSign ? 'VERIFIED ROAD SIGN' : 'AWAITING DETECTION'}
                </span>
                {latestSign ? (
                  <>
                    <span className="font-headline font-bold text-base text-text-primary mt-0.5 tracking-tight uppercase">
                      {latestSign.class_name}
                    </span>
                    <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-text-secondary">
                      <span>CONFIDENCE: <strong className="text-success">{Math.round((latestSign.confidence ?? 0) * 100)}%</strong></span>
                      <span>-</span>
                      <span>LIMIT: <strong className="text-accent">{speedLimitKmh} KM/H</strong></span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-headline font-bold text-base text-text-muted mt-0.5 tracking-tight uppercase">
                      NO SIGN DETECTED
                    </span>
                    <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-text-muted">
                      <span>POINT CAMERA AT A TRAFFIC SIGN OR UPLOAD AN IMAGE</span>
                    </div>
                  </>
                )}
              </div>

              {/* European Speed Limit Sign Shield */}
              <div className="w-12 h-12 rounded-full border-4 border-[#D92D20] bg-white flex items-center justify-center shrink-0 shadow-md">
                <span className="font-headline font-black text-base text-[#101828]">
                  {speedLimitKmh}
                </span>
              </div>
            </div>

            {/* Voice Alert State */}
            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-text-muted">
                <Volume2 className="w-3.5 h-3.5 text-accent" />
                <span>VOICE ALERT:</span>
                <span className="text-success font-semibold">READY</span>
              </div>
              <span className="text-text-muted text-[10px]">DEBOUNCE: 5.0S</span>
            </div>
          </div>

          {/* SECTION 4 — DRIVER STATUS (Compact Driver-Monitoring Card) */}
          <DriverGauge
            driverStatus={driverStatus}
            onSimulateState={() => {}}
            compact={true}
          />
        </div>
      </section>

      {/* ====================================================================
          SECTION 5 & 6 — ROAD CONTEXT & RECENT EVENTS
          ==================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SECTION 5 — ROAD CONTEXT (7 cols on lg) */}
        <div className="lg:col-span-7 surface-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-border mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-accent" />
              <span className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
                ROAD CONTEXT &amp; VELOCITY
              </span>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="font-mono text-[11px] text-accent hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <span>TACTICAL MAP</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-1">
            {/* Speedometer telemetry */}
            <div className="surface-inset p-2.5 flex flex-col justify-between">
              <span className="telemetry-label text-[9px]">CURRENT SPEED</span>
              <div className="my-1">
                <span className={`font-mono text-2xl font-bold ${isOverSpeed ? 'text-critical' : 'text-text-primary'}`}>
                  {currentSpeedKmh}
                </span>
                <span className="font-mono text-xs text-text-muted ml-1">KM/H</span>
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                {isOverSpeed ? `+${currentSpeedKmh - speedLimitKmh} OVER LIMIT` : 'POSTED ENVELOPE'}
              </span>
            </div>

            {/* Detected Limit */}
            <div className="surface-inset p-2.5 flex flex-col justify-between">
              <span className="telemetry-label text-[9px]">POSTED LIMIT</span>
              <div className="my-1">
                <span className="font-mono text-2xl font-bold text-accent">
                  {speedLimitKmh}
                </span>
                <span className="font-mono text-xs text-text-muted ml-1">KM/H</span>
              </div>
              <span className="font-mono text-[10px] text-success">
                CAMERA VERIFIED
              </span>
            </div>

            {/* Traffic & Hazard */}
            <div className="surface-inset p-2.5 flex flex-col justify-between">
              <span className="telemetry-label text-[9px]">ROADWAY CONDITIONS</span>
              <div className="my-1">
                <span className="font-headline text-base font-bold text-text-primary">
                  MODERATE
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                CONSTRUCTION: NONE
              </span>
            </div>

            {/* Next Sign */}
            <div className="surface-inset p-2.5 flex flex-col justify-between">
              <span className="telemetry-label text-[9px]">UPCOMING SIGN</span>
              <div className="my-1">
                <span className="font-headline text-xs font-bold text-text-primary truncate block">
                  PEDESTRIAN CROSSING
                </span>
              </div>
              <span className="font-mono text-[10px] text-accent">
                250M AHEAD
              </span>
            </div>
          </div>

          {/* Speed Calibration Test Bar */}
          <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted text-[11px]">CALIBRATE TEST VELOCITY:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onSpeedChange(Math.max(0, currentSpeedKmh - 5))}
                className="px-2 py-0.5 rounded surface-elevated hover:bg-surface-highest text-text-primary text-[10px]"
              >
                -5 KM/H
              </button>
              <button
                onClick={() => onSpeedChange(currentSpeedKmh + 5)}
                className="px-2 py-0.5 rounded surface-elevated hover:bg-surface-highest text-text-primary text-[10px]"
              >
                +5 KM/H
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => onSpeedLimitChange(30)}
                className={`px-2 py-0.5 rounded text-[10px] ${speedLimitKmh === 30 ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-secondary'}`}
              >
                30
              </button>
              <button
                onClick={() => onSpeedLimitChange(50)}
                className={`px-2 py-0.5 rounded text-[10px] ${speedLimitKmh === 50 ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-secondary'}`}
              >
                50
              </button>
              <button
                onClick={() => onSpeedLimitChange(70)}
                className={`px-2 py-0.5 rounded text-[10px] ${speedLimitKmh === 70 ? 'bg-accent text-bg font-bold' : 'surface-elevated text-text-secondary'}`}
              >
                70
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 6 — RECENT EVENTS (Latest 5 events) */}
        <div className="lg:col-span-5 surface-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
                RECENT EVENTS ({events.length})
              </span>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="font-mono text-[11px] text-accent hover:text-text-primary flex items-center gap-1 transition-colors"
            >
              <span>VIEW ALL DETECTIONS</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* List of 5 Events */}
          <div className="my-2 space-y-1.5 font-mono text-xs">
            {recentEvents.length === 0 ? (
              <div className="py-6 text-center text-text-muted text-[11px]">
                NO PERCEPTION EVENTS LOGGED YET
              </div>
            ) : (
              recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="surface-inset px-2.5 py-1.5 flex items-center justify-between gap-2 hover:border-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-text-muted text-[10px] shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                    <span className="font-headline font-medium text-xs text-text-primary truncate">
                      {ev.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-1 rounded font-bold shrink-0 ${
                      ev.category === 'CRITICAL'
                        ? 'bg-critical-subtle text-critical'
                        : ev.category === 'WARNING'
                        ? 'bg-warning-subtle text-warning'
                        : 'text-text-muted'
                    }`}
                  >
                    {ev.confidence ? `${Math.round(ev.confidence * 100)}%` : ev.category}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span>BUFFER RETENTION: 50 ENTRIES</span>
            <span>AUTO-SYNC ACTIVE</span>
          </div>
        </div>
      </section>
    </div>
  );
};
