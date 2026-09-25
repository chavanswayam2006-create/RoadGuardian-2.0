import React, { useState } from 'react';
import { History, Volume2, Trash2 } from 'lucide-react';
import type { SafetyEvent, AlertCategory } from '../types';

interface EventTickerProps {
  events: SafetyEvent[];
  onClearEvents: () => void;
}

export const EventTicker: React.FC<EventTickerProps> = ({ events, onClearEvents }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    return ev.category === filter;
  });

  const getCategoryBadge = (cat: AlertCategory) => {
    switch (cat) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-500 text-red-300';
      case 'WARNING':
        return 'bg-amber-950/80 border-amber-500 text-amber-300';
      case 'ADVISORY':
        return 'bg-blue-950/80 border-blue-500 text-blue-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="hud-card hud-brackets flex flex-col h-full bg-slate-900/90 backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/80 text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <History className="w-4 h-4" />
          <span className="font-bold tracking-wider uppercase">SAFETY EVENT TIMELINE</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
            {events.length} LOGGED
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1">
            {(['ALL', 'CRITICAL', 'WARNING'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  filter === tab
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {events.length > 0 && (
            <button
              onClick={onClearEvents}
              title="Clear Event Log"
              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Event Stream List */}
      <div className="flex-1 overflow-y-auto max-h-[220px] p-2 space-y-1.5 text-xs font-mono">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs py-8">
            NO SAFETY INCIDENTS RECORDED IN TIMELINE
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-start justify-between gap-2 p-2 rounded bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${getCategoryBadge(ev.category)}`}>
                  {ev.category}
                </span>
                <div>
                  <div className="font-bold text-slate-200 uppercase tracking-tight">{ev.title}</div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">{ev.message}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-500 shrink-0">
                {ev.spoken && (
                  <span title="Voice Synthesized">
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                  </span>
                )}
                <span>
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
