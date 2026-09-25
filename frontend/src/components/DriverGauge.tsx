import React from 'react';
import { Eye, Sliders } from 'lucide-react';
import type { DriverStatus, DriverState } from '../types';

interface DriverGaugeProps {
  driverStatus: DriverStatus;
  onSimulateState: (state: DriverState) => void;
}

export const DriverGauge: React.FC<DriverGaugeProps> = ({ driverStatus, onSimulateState }) => {
  const { state, ear_average, head_pose, gaze_direction, eyes_closed, confidence } = driverStatus;

  // State styling helper
  const getStateBadge = () => {
    switch (state) {
      case 'ATTENTIVE':
        return {
          pill: 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 glow-success',
          dot: 'bg-emerald-400',
          label: 'ATTENTIVE • ROAD FOCUSED',
        };
      case 'ATTENTION_WARNING':
        return {
          pill: 'bg-amber-950/80 border-amber-500/80 text-amber-300 animate-pulse-warning',
          dot: 'bg-amber-400',
          label: 'ATTENTION DRIFT DETECTED',
        };
      case 'DROWSINESS_WARNING':
        return {
          pill: 'bg-red-950/90 border-red-500 text-red-200 animate-pulse-critical',
          dot: 'bg-red-500 animate-ping',
          label: 'DROWSINESS WARNING: MICRO-SLEEP',
        };
      case 'FACE_NOT_DETECTED':
        return {
          pill: 'bg-orange-950/80 border-orange-500/80 text-orange-300',
          dot: 'bg-orange-400',
          label: 'DRIVER NOT IN FRAME',
        };
      default:
        return {
          pill: 'bg-slate-800 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          label: 'INITIALIZING DMS...',
        };
    }
  };

  const badge = getStateBadge();
  const earPercent = Math.min(100, Math.max(0, (ear_average / 0.40) * 100));

  // Gaze reticle offset (-30 to +30 deg to pixel offset)
  const gazeX = Math.max(-40, Math.min(40, (head_pose.yaw || 0) * 2));
  const gazeY = Math.max(-40, Math.min(40, (head_pose.pitch || 0) * 2));

  return (
    <div className="hud-card hud-brackets flex flex-col p-4 bg-slate-900/90 backdrop-blur-md">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Eye className="w-4 h-4" />
          <span className="font-mono text-xs font-bold tracking-wider uppercase">IN-CABIN DRIVER MONITOR (DMS)</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">MEDIAPIPE 468-PT MESH</span>
      </div>

      {/* Driver State Banner */}
      <div className={`p-2.5 rounded-lg border flex items-center justify-between mb-4 ${badge.pill}`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${badge.dot}`} />
          <span className="font-mono text-xs font-bold tracking-wide uppercase">{badge.label}</span>
        </div>
        <span className="font-mono text-[11px] opacity-80">{(confidence * 100).toFixed(0)}% CONF</span>
      </div>

      {/* Grid of Gauges: EAR Dial + Gaze Coordinate Crosshair */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Eye Aspect Ratio (EAR) Gauge */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400 uppercase">EYE ASPECT RATIO (EAR)</span>
            <span className={`font-bold ${ear_average < 0.20 ? 'text-red-400' : 'text-cyan-300'}`}>
              {ear_average.toFixed(2)}
            </span>
          </div>

          {/* Progress Bar with 0.20 Threshold Line */}
          <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                ear_average < 0.20
                  ? 'bg-red-500 shadow-[0_0_10px_#EF4444]'
                  : ear_average < 0.25
                  ? 'bg-amber-400'
                  : 'bg-emerald-400 shadow-[0_0_10px_#10B981]'
              }`}
              style={{ width: `${earPercent}%` }}
            />
            {/* Threshold Line at 50% (corresponding to 0.20 / 0.40) */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
              style={{ left: '50%' }}
              title="Alert Threshold (0.20)"
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0.00 CLOSED</span>
            <span className="text-red-400 font-semibold">THRESH 0.20</span>
            <span>0.40 OPEN</span>
          </div>

          <div className="mt-2 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>EYES STATE:</span>
            <span className={eyes_closed ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
              {eyes_closed ? 'SHUT / OCCLUDED' : 'OPEN & ALERT'}
            </span>
          </div>
        </div>

        {/* Head Pose & Gaze Reticle */}
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-slate-400 uppercase">HEAD GAZE VECTOR</span>
            <span className="text-cyan-300 font-bold uppercase">{gaze_direction}</span>
          </div>

          {/* 2D Crosshair Target */}
          <div className="relative w-28 h-24 rounded-md border border-cyan-500/30 bg-slate-900/50 flex items-center justify-center my-1">
            {/* Crosshair lines */}
            <div className="absolute inset-x-0 h-px bg-cyan-500/20" />
            <div className="absolute inset-y-0 w-px bg-cyan-500/20" />
            
            {/* Safe gaze center box */}
            <div className="w-8 h-8 rounded border border-emerald-500/40 border-dashed" />

            {/* Gaze Target Vector Dot */}
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4] transition-all duration-200"
              style={{
                transform: `translate(${gazeX}px, ${gazeY}px)`,
              }}
            />
          </div>

          <div className="w-full grid grid-cols-3 text-center text-[10px] font-mono text-slate-400 mt-1">
            <div>P: {head_pose.pitch.toFixed(1)}°</div>
            <div>Y: {head_pose.yaw.toFixed(1)}°</div>
            <div>R: {head_pose.roll.toFixed(1)}°</div>
          </div>
        </div>
      </div>

      {/* Driver State Simulator Controls */}
      <div className="border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 mb-2">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIMULATE DRIVER STATES (TEST BENCH):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onSimulateState('ATTENTIVE')}
            className={`px-2 py-1.5 rounded text-[11px] font-mono font-semibold border transition-all ${
              state === 'ATTENTIVE'
                ? 'bg-emerald-900/70 border-emerald-500 text-emerald-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            ATTENTIVE
          </button>
          <button
            onClick={() => onSimulateState('DROWSINESS_WARNING')}
            className={`px-2 py-1.5 rounded text-[11px] font-mono font-semibold border transition-all ${
              state === 'DROWSINESS_WARNING'
                ? 'bg-red-900/70 border-red-500 text-red-200 shadow-[0_0_10px_#EF4444]'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            EYES CLOSED
          </button>
          <button
            onClick={() => onSimulateState('ATTENTION_WARNING')}
            className={`px-2 py-1.5 rounded text-[11px] font-mono font-semibold border transition-all ${
              state === 'ATTENTION_WARNING'
                ? 'bg-amber-900/70 border-amber-500 text-amber-200 shadow-[0_0_10px_#F59E0B]'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            DISTRACTED
          </button>
          <button
            onClick={() => onSimulateState('FACE_NOT_DETECTED')}
            className={`px-2 py-1.5 rounded text-[11px] font-mono font-semibold border transition-all ${
              state === 'FACE_NOT_DETECTED'
                ? 'bg-orange-900/70 border-orange-500 text-orange-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            OCCLUDED
          </button>
        </div>
      </div>
    </div>
  );
};
