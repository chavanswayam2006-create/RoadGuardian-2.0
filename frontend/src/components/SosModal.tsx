import React from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-low border border-error/50 rounded-2xl max-w-md w-full p-space-lg shadow-2xl space-y-space-md text-on-surface">
        <div className="flex items-center gap-space-sm text-error">
          <div className="w-12 h-12 rounded-xl bg-error-container/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">sos</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
              Emergency Assistance Hotline
            </h2>
            <span className="font-label-caps text-[10px] text-error">PRIORITY DISPATCH LINK</span>
          </div>
        </div>

        <div className="p-space-sm bg-surface-container rounded-lg space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-outline">Current Sector:</span>
            <span className="font-semibold text-on-surface">{roadName}</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-outline">GPS Coordinates:</span>
            <span className="text-primary font-bold">
              {lat.toFixed(4)}° N, {lon.toFixed(4)}° E
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-outline">Vehicle Status:</span>
            <span className="text-tertiary font-bold">TELEMETRY SECURED</span>
          </div>
        </div>

        <div className="space-y-2">
          <a
            href="tel:112"
            className="w-full py-2.5 rounded-xl bg-error text-on-error font-headline-sm text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-error-container transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call 112 (European Emergency)</span>
          </a>
          <a
            href="tel:+4989767676"
            className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-headline-sm text-[14px] flex items-center justify-center gap-2 transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">build</span>
            <span>ADAC Roadside Assistance (+49 89 767676)</span>
          </a>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-2 rounded-lg text-outline hover:text-on-surface font-label-caps text-[11px] text-center"
        >
          Cancel &amp; Return to Cockpit
        </button>
      </div>
    </div>
  );
};
