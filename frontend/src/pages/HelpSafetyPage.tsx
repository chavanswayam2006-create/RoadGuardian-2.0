import React from 'react';

export const HelpSafetyPage: React.FC = () => {
  return (
    <div className="p-space-lg flex flex-col gap-space-lg w-full max-w-[1200px] mx-auto text-on-surface">
      {/* Page Header */}
      <div className="flex flex-col gap-1 pb-space-xs border-b border-outline-variant/20">
        <div className="flex items-center gap-space-xs font-label-caps text-label-caps text-primary uppercase">
          <span className="material-symbols-outlined text-[16px]">help_center</span>
          <span>Operator Manual &amp; Safety Compliance</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-1">
          Help, Safety Guidelines &amp; Regulatory Protocol
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Complete guide to operating the RoadGuard AI cockpit HUD during evaluation and road trials.
        </p>
      </div>

      {/* Grid Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Card 1: System Purpose & Boundaries */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">SAE Level 2+ Role</h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            RoadGuard AI provides <strong>situational awareness enhancements</strong>. It is designed to notify the
            driver of upcoming speed restrictions, pedestrian crosswalks, traffic light phases, and physical signs
            of in-cabin drowsiness or distraction.
          </p>
          <div className="p-space-sm bg-surface-container rounded-lg border-l-4 border-error text-xs text-on-surface-variant">
            <strong className="text-on-surface block mb-1">Human Responsibility Mandate:</strong>
            The driver remains the primary supervisor of the vehicle at all times and must maintain hands on the
            steering wheel and visual command of the roadway.
          </div>
        </div>

        {/* Card 2: Voice Alert Hierarchy */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[20px]">notifications_active</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Alert Priority Tiers</h2>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded bg-error-container/30 border border-error/40 text-on-surface">
              <span className="font-label-caps text-error font-bold block">PRIORITY 1: CRITICAL (RED)</span>
              <span>Drowsiness micro-sleep detection or red traffic light breach. Audio alarm triggers immediately without debounce throttling.</span>
            </div>
            <div className="p-2 rounded bg-secondary-container/30 border border-secondary/40 text-on-surface">
              <span className="font-label-caps text-secondary font-bold block">PRIORITY 2: WARNING (AMBER)</span>
              <span>Attention drift or overspeed exceeding +5 km/h. Audio announced with 5.0s rate-limiting.</span>
            </div>
            <div className="p-2 rounded bg-surface-container text-on-surface-variant">
              <span className="font-label-caps text-tertiary font-bold block">PRIORITY 3: ADVISORY (BLUE/GREEN)</span>
              <span>Speed limit zone adjustments, verified navigation signs. In-dash banner update.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Keyboard Shortcuts */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">keyboard</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Evaluation Keybindings</h2>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-1.5 rounded bg-surface-container">
              <span className="text-on-surface">Click '-5 / +5' in Speed Bench</span>
              <span className="text-primary font-bold">Simulate Velocity</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-surface-container">
              <span className="text-on-surface">Click '30 / 50 / 70 / 100'</span>
              <span className="text-primary font-bold">Change Speed Limit</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-surface-container">
              <span className="text-on-surface">DMS 'Drowsy / Distracted'</span>
              <span className="text-primary font-bold">Simulate Micro-Sleep</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-surface-container">
              <span className="text-on-surface">Volume Icon in Top Header</span>
              <span className="text-primary font-bold">Mute / Unmute Voice</span>
            </div>
          </div>
        </div>

        {/* Card 4: Technical Support & SOS */}
        <div className="p-space-md bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm space-y-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">sos</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">Emergency Response (SOS)</h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            The left sidebar includes an <strong>SOS Hotline</strong> quick button. In connected fleet vehicles,
            triggering this transmits current telemetry coordinates (GNSS latitude/longitude) to local automotive
            dispatchers (ADAC / Bosch Roadside Support).
          </p>
          <div className="p-space-sm bg-surface-container rounded-lg text-xs font-mono text-outline">
            Munich Central Dispatch: +49 89 767676 | Emergency: 112
          </div>
        </div>
      </div>
    </div>
  );
};
