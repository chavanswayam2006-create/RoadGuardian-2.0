import React from 'react';
import { Bell, X, Trash2 } from 'lucide-react';
import type { SafetyEvent } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: SafetyEvent[];
  onClearEvents: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onClearEvents,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="surface-card w-full max-w-sm h-full p-4 border-l border-border flex flex-col shadow-2xl text-text-primary rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-accent" />
            <h2 className="font-headline font-bold text-xs tracking-wider uppercase text-text-primary">
              TELEMETRY BUFFER ({events.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            aria-label="Close notifications panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {events.length === 0 ? (
            <div className="py-16 text-center text-text-muted text-xs font-mono">
              NO TELEMETRY LOGS IN ACTIVE BUFFER
            </div>
          ) : (
            events.map((ev) => {
              const isCrit = ev.category === 'CRITICAL';
              const isWarn = ev.category === 'WARNING';

              return (
                <div
                  key={ev.id}
                  className="surface-inset p-2.5 space-y-1 transition-colors hover:border-accent/30"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isCrit
                          ? 'bg-critical text-bg'
                          : isWarn
                          ? 'bg-warning text-bg'
                          : 'bg-accent/20 text-accent'
                      }`}
                    >
                      {ev.category}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                    </span>
                  </div>
                  <div className="font-headline font-bold text-xs text-text-primary truncate">
                    {ev.title}
                  </div>
                  <p className="font-body text-[11px] text-text-secondary line-clamp-2">
                    {ev.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex gap-2">
          <button
            onClick={onClearEvents}
            type="button"
            className="flex-1 py-1.5 rounded bg-surface-elevated hover:bg-critical/20 hover:text-critical text-text-secondary text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>FLUSH</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-1.5 rounded bg-accent hover:bg-accent-strong text-bg text-xs font-headline font-bold uppercase transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
