import React from 'react';
import { Eye } from 'lucide-react';
import type { DriverStatus, DriverState } from '../types';

interface DriverGaugeProps {
  driverStatus: DriverStatus;
  onSimulateState: (state: DriverState) => void;
  compact?: boolean;
}

export const DriverGauge: React.FC<DriverGaugeProps> = ({
  driverStatus,
  onSimulateState,
  compact = false,
}) => {
  const { state, ear_average, head_pose, gaze_direction, eyes_closed, confidence } = driverStatus;

  const isDrowsy = state === 'DROWSINESS_WARNING';
  const isDistracted = state === 'ATTENTION_WARNING';
  const isAttentive = state === 'ATTENTIVE';

  const safeHeadPose = head_pose || { pitch: 0, yaw: 0, roll: 0 };
  const earPercent = Math.min(100, Math.max(0, (ear_average / 0.40) * 100));

  // Gaze crosshair offset in coordinate box
  const gazeX = Math.max(-28, Math.min(28, (safeHeadPose.yaw || 0) * 1.5));
  const gazeY = Math.max(-28, Math.min(28, (safeHeadPose.pitch || 0) * 1.5));

  return (
    <div className="surface-card p-4 flex flex-col justify-between select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" />
          <span className="font-headline font-bold text-xs tracking-wider text-text-primary uppercase">
            DRIVER STATUS
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-muted">
          IR DMS // 468-PT
        </span>
      </div>

      {/* Main State Card */}
      <div
        className={`p-2.5 rounded-md border flex items-center justify-between mb-3 transition-colors ${
          isAttentive
            ? 'bg-success-subtle border-success/30 text-success'
            : isDrowsy
            ? 'bg-critical-subtle border-critical critical-pulse text-critical'
            : 'bg-warning-subtle border-warning/40 text-warning'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isAttentive ? 'bg-success' : isDrowsy ? 'bg-critical' : 'bg-warning'
            }`}
          />
          <div className="flex flex-col">
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase">
              {state.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] opacity-80 font-body">
              {isAttentive
                ? 'Road focused & responsive'
                : isDrowsy
                ? 'Visible signs of micro-sleep detected'
                : 'Attention deviation observed'}
            </span>
          </div>
        </div>
        <span className="font-mono text-[11px] font-bold">
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Structured Telemetry Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Eye Aspect Ratio (EAR) */}
        <div className="surface-inset p-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mb-1">
            <span>EAR METRIC</span>
            <span
              className={`font-bold ${
                ear_average < 0.20 ? 'text-critical' : 'text-text-primary'
              }`}
            >
              {ear_average.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-200 ${
                ear_average < 0.20 ? 'bg-critical' : 'bg-success'
              }`}
              style={{ width: `${earPercent}%` }}
            />
            {/* 0.20 Threshold Marker at 50% */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-warning/80" />
          </div>
          <span className="text-[9px] font-mono text-text-muted mt-1">
            {eyes_closed ? 'EYES CLOSED' : 'EYES OPEN'} (LIMIT 0.20)
          </span>
        </div>

        {/* Gaze Vector Target */}
        <div className="surface-inset p-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="telemetry-label text-[9px]">GAZE DIRECTION</span>
            <span className="font-mono text-xs font-bold text-text-primary mt-0.5 uppercase">
              {gaze_direction || 'FORWARD'}
            </span>
            <span className="font-mono text-[9px] text-text-muted mt-0.5">
              P:{safeHeadPose.pitch.toFixed(1)}° Y:{safeHeadPose.yaw.toFixed(1)}°
            </span>
          </div>

          {/* Mini 2D Crosshair Reticle */}
          <div className="relative w-9 h-9 rounded bg-surface border border-border flex items-center justify-center shrink-0">
            <div className="absolute inset-x-1 top-1/2 h-px bg-border" />
            <div className="absolute inset-y-1 left-1/2 w-px bg-border" />
            <div
              className="absolute w-2 h-2 rounded-full bg-accent border border-surface transition-all duration-150"
              style={{
                transform: `translate(${gazeX}px, ${gazeY}px)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* State Simulation Buttons (Evaluation Workbench) */}
      {!compact && (
        <div className="pt-2 border-t border-border flex items-center justify-between gap-1 text-[10px] font-mono">
          <span className="text-text-muted uppercase">TEST BENCH:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSimulateState('ATTENTIVE')}
              className={`px-2 py-0.5 rounded transition-colors ${
                isAttentive
                  ? 'bg-success/20 text-success font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              SAFE
            </button>
            <button
              onClick={() => onSimulateState('ATTENTION_WARNING')}
              className={`px-2 py-0.5 rounded transition-colors ${
                isDistracted
                  ? 'bg-warning/20 text-warning font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              DISTRACTED
            </button>
            <button
              onClick={() => onSimulateState('DROWSINESS_WARNING')}
              className={`px-2 py-0.5 rounded transition-colors ${
                isDrowsy
                  ? 'bg-critical/20 text-critical font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              DROWSY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
