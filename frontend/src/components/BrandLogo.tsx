import React from 'react';

interface BrandLogoProps {
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Precision Automotive Vector Mark */}
      <div className="relative w-8 h-8 rounded-sm bg-surface-elevated border border-accent/30 flex items-center justify-center shrink-0 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Shield Geometry */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {/* Inner Optical Reticle */}
          <circle cx="12" cy="11" r="3" strokeWidth="1.5" />
          <line x1="12" y1="5" x2="12" y2="7" />
          <line x1="12" y1="15" x2="12" y2="17" />
          <line x1="6" y1="11" x2="8" y2="11" />
          <line x1="16" y1="11" x2="18" y2="11" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-success status-pulse" />
      </div>

      {!compact && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-headline font-bold text-[15px] tracking-tight text-text-primary">
              ROADGUARD
            </span>
            <span className="font-mono font-semibold text-[10px] px-1 py-0.2 rounded bg-accent/15 text-accent border border-accent/20">
              2.0
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted mt-0.5">
            PRECISION ADAS
          </span>
        </div>
      )}
    </div>
  );
};
