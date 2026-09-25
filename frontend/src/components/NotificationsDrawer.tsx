import React from 'react';
import type { SafetyEvent } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: SafetyEvent[];
  onClear: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-low w-full max-w-sm h-full p-space-md border-l border-outline-variant/30 flex flex-col shadow-2xl text-on-surface">
        <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">notifications</span>
            <h2 className="font-headline-sm text-[16px] font-semibold text-on-surface">
              Safety Notifications ({events.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
            aria-label="Close notifications panel"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-space-sm space-y-2">
          {events.length === 0 ? (
            <div className="py-12 text-center text-outline text-xs">
              No recent notifications logged.
            </div>
          ) : (
            events.map((ev) => (
              <div
                key={ev.id}
                className="p-space-xs bg-surface-container rounded-lg border border-outline-variant/10 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-label-caps text-[9px] px-1 rounded font-bold ${
                      ev.category === 'CRITICAL'
                        ? 'bg-error-container text-on-error'
                        : ev.category === 'WARNING'
                        ? 'bg-secondary-container/40 text-secondary'
                        : 'bg-primary-container/20 text-primary'
                    }`}
                  >
                    {ev.category}
                  </span>
                  <span className="font-mono text-[9px] text-outline">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                </div>
                <div className="font-semibold text-on-surface mt-1 truncate">{ev.title}</div>
                <div className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                  {ev.message}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-space-xs border-t border-outline-variant/20 flex gap-2">
          <button
            onClick={onClear}
            className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-error text-xs font-label-caps"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-label-caps"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
