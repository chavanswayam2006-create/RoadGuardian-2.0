import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { AlertCategory } from '../types';

interface AlertBannerProps {
  alert: {
    category: AlertCategory;
    title: string;
    message: string;
    action_required?: string;
  } | null;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const isCritical = alert.category === 'CRITICAL';
  const isWarning = alert.category === 'WARNING';

  return (
    <div
      role="alert"
      className={`mb-3 p-3 rounded-md border flex items-center justify-between gap-3 transition-all duration-200 ${
        isCritical
          ? 'bg-critical-subtle border-critical critical-pulse text-text-primary'
          : isWarning
          ? 'bg-warning-subtle border-warning text-text-primary'
          : 'bg-surface-elevated border-accent/30 text-text-primary'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0">
          {isCritical ? (
            <AlertCircle className="w-5 h-5 text-critical" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-warning" />
          ) : (
            <Info className="w-5 h-5 text-accent" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                isCritical
                  ? 'bg-critical text-bg'
                  : isWarning
                  ? 'bg-warning text-bg'
                  : 'bg-accent/20 text-accent'
              }`}
            >
              {alert.category}
            </span>
            <span className="font-headline font-bold text-xs tracking-wide text-text-primary uppercase truncate">
              {alert.title}
            </span>
          </div>
          <p className="font-body text-xs text-text-secondary mt-0.5 truncate">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {alert.action_required && (
          <span className="hidden sm:inline-block font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-bg/80 border border-border text-text-primary">
            {alert.action_required}
          </span>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            type="button"
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg/40 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
