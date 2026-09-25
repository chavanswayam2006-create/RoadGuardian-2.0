import React from 'react';
import { ShieldCheck, Info, AlertTriangle, Keyboard, PhoneCall } from 'lucide-react';

export const HelpSafetyPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-[1200px] mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h1 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
            SAFETY GUIDELINES &amp; OPERATOR PROTOCOL
          </h1>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-success border border-border">
            ISO 26262 ASIL-B
          </span>
        </div>
        <span className="font-mono text-xs text-text-muted">SAE LEVEL 2+ ADAS</span>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: SAE Level 2+ Operating Boundaries */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Info className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              OPERATIONAL ROLE &amp; BOUNDARIES
            </h2>
          </div>
          <p className="font-body text-xs text-text-secondary leading-relaxed">
            RoadGuardian 2.0 provides <strong>situational awareness assistance</strong>. It detects regulatory road signs, speed limits, crosswalks, and optical indicators of driver distraction or micro-sleep.
          </p>
          <div className="surface-inset p-3 border-l-2 border-warning text-xs text-text-secondary space-y-1">
            <strong className="text-text-primary font-headline block">Driver Responsibility Mandate:</strong>
            The human driver remains the primary supervisor of the motor vehicle at all times and must maintain hands on the wheel and active command of the roadway.
          </div>
        </div>

        {/* Card 2: Voice Alert Hierarchy */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              ALERT PRIORITY TIERS
            </h2>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-critical-subtle border border-critical/30 text-text-primary">
              <span className="text-critical font-bold block text-[10px]">PRIORITY 1: CRITICAL (RED)</span>
              <span className="text-[11px] text-text-secondary font-body">
                Drowsiness micro-sleep detection or red light violation. Immediate voice alarm bypasses debounce.
              </span>
            </div>
            <div className="p-2 rounded bg-warning-subtle border border-warning/30 text-text-primary">
              <span className="text-warning font-bold block text-[10px]">PRIORITY 2: WARNING (AMBER)</span>
              <span className="text-[11px] text-text-secondary font-body">
                Attention drift or overspeed exceeding posted limit (+5 km/h). Debounced voice alert.
              </span>
            </div>
            <div className="p-2 rounded surface-inset text-text-secondary">
              <span className="text-accent font-bold block text-[10px]">PRIORITY 3: ADVISORY (BLUE/GREEN)</span>
              <span className="text-[11px] text-text-secondary font-body">
                Speed limit changes and verified road signs. In-cockpit HUD update.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Evaluation Hotkeys */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Keyboard className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              EVALUATION KEYBINDINGS &amp; CONTROLS
            </h2>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between p-2 rounded surface-inset">
              <span className="text-text-secondary">Click '-5 / +5' in Speed Bench</span>
              <span className="text-accent font-bold">Simulate Velocity</span>
            </div>
            <div className="flex justify-between p-2 rounded surface-inset">
              <span className="text-text-secondary">Click '30 / 50 / 70 / 100'</span>
              <span className="text-accent font-bold">Change Limit</span>
            </div>
            <div className="flex justify-between p-2 rounded surface-inset">
              <span className="text-text-secondary">DMS 'Drowsy / Distracted'</span>
              <span className="text-critical font-bold">Simulate Fatigue</span>
            </div>
            <div className="flex justify-between p-2 rounded surface-inset">
              <span className="text-text-secondary">Header Audio Icon</span>
              <span className="text-accent font-bold">Mute / Unmute Voice</span>
            </div>
          </div>
        </div>

        {/* Card 4: Emergency Assistance */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <PhoneCall className="w-4 h-4 text-critical" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              EMERGENCY PROTOCOL (SOS)
            </h2>
          </div>
          <p className="font-body text-xs text-text-secondary leading-relaxed">
            The sidebar includes a dedicated <strong>EMERGENCY SOS</strong> trigger. Triggering this transmits GNSS latitude/longitude telemetry to roadside support and presents direct links to emergency dispatch.
          </p>
          <div className="surface-inset p-2.5 font-mono text-[11px] text-text-muted space-y-0.5">
            <div>CENTRAL DISPATCH: <strong className="text-text-primary">+49 89 767676</strong></div>
            <div>EUROPEAN EMERGENCY: <strong className="text-critical">112</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
