import React from 'react';
import { PhoneCall, Wrench, X, ShieldAlert } from 'lucide-react';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lon: number;
  roadName: string;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, lat, lon, roadName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="surface-card border border-critical/40 max-w-md w-full p-5 shadow-2xl space-y-4 text-text-primary">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-critical-subtle text-critical flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
                EMERGENCY DISPATCH
              </h2>
              <span className="font-mono text-[10px] text-critical tracking-wider">
                SAFETY PROTOCOL HOTLINE
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Snapshot for Dispatch */}
        <div className="surface-inset p-3 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-text-muted">SECTOR:</span>
            <span className="font-semibold text-text-primary truncate max-w-[200px]">{roadName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">GNSS COORD:</span>
            <span className="text-accent font-bold">
              {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">STATUS:</span>
            <span className="text-success font-bold">TELEMETRY LOCKED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href="tel:112"
            className="w-full py-2.5 rounded bg-critical hover:bg-critical/90 text-bg font-headline text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 112 (European Emergency)</span>
          </a>
          <a
            href="tel:+4989767676"
            className="w-full py-2.5 rounded bg-surface-elevated hover:bg-surface-highest text-text-primary border border-border font-headline text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <Wrench className="w-4 h-4 text-accent" />
            <span>ADAC Roadside Assistance (+49 89 767676)</span>
          </a>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-1.5 text-text-muted hover:text-text-primary font-mono text-[11px] text-center"
        >
          Cancel &amp; Return to Cockpit
        </button>
      </div>
    </div>
  );
};
