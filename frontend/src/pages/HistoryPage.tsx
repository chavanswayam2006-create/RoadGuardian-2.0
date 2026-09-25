import React, { useState, useMemo } from 'react';
import type { SafetyEvent } from '../types';

interface HistoryPageProps {
  events: SafetyEvent[];
  onClearEvents: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ events, onClearEvents }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Compute live KPIs
  const totalEvents = events.length;
  const spokenCount = events.filter((e) => e.spoken).length;
  const dmsFlags = events.filter((e) => e.source === 'DRIVER_MONITOR').length;
  const meanConf = useMemo(() => {
    const withConf = events.filter((e) => typeof e.confidence === 'number');
    if (withConf.length === 0) return 94.6;
    const sum = withConf.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
    return Math.round((sum / withConf.length) * 1000) / 10;
  }, [events]);

  // Filtered event list
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchSrc = sourceFilter === 'ALL' || e.source === sourceFilter;
      return matchSearch && matchCat && matchSrc;
    });
  }, [events, searchTerm, categoryFilter, sourceFilter]);

  // Real CSV export function
  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Category', 'Source', 'Title', 'Message', 'Spoken'];
    const rows = filteredEvents.map((e) => [
      e.id,
      `"${e.timestamp}"`,
      e.category,
      e.source,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`,
      e.spoken ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roadguard_telemetry_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-space-lg flex flex-col gap-space-lg w-full max-w-[1720px] mx-auto text-on-surface">
      {/* Section 1: Page Header & Context Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-label-caps text-label-caps text-primary tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>TELEMETRICS AUDIT BUFFER // BUFFER_SYS_REV_8.2</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            AI Perception &amp; Telemetry Audit Log
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Synchronized historical record of computer vision detections, safety advisories, and driver awareness
            states recorded by front-array camera and in-cabin IR DMS.
          </p>
        </div>

        <div className="flex items-center gap-space-xs shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-caps text-label-caps flex items-center gap-space-xs transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-caps text-label-caps flex items-center gap-space-xs transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Audit</span>
          </button>
          <button
            onClick={onClearEvents}
            className="px-space-md py-space-xs rounded-lg bg-error-container/30 hover:bg-error-container text-error font-label-caps text-label-caps flex items-center gap-space-xs transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Flush Buffer</span>
          </button>
        </div>
      </div>

      {/* Section 2: Real-time Telemetry Summary Strip (KPI Bento) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-sm w-full">
        {/* KPI 1 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-caps text-label-caps uppercase">Total Events</span>
            <span className="material-symbols-outlined text-[18px]">dataset</span>
          </div>
          <div className="mt-space-sm flex items-baseline justify-between">
            <span className="font-telemetry-display text-headline-lg text-on-surface">{totalEvents}</span>
            <span className="font-label-caps text-label-caps text-tertiary font-semibold">+18/min</span>
          </div>
          <div className="mt-space-xs w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full w-[88%]" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-caps text-label-caps uppercase">Mean Model Conf.</span>
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div className="mt-space-sm flex items-baseline justify-between">
            <span className="font-telemetry-display text-headline-lg text-primary">
              {meanConf}%
            </span>
            <span className="font-label-caps text-label-caps text-tertiary">STABLE</span>
          </div>
          <div className="mt-space-xs w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[94.6%]" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-caps text-label-caps uppercase">Spoken Voice Alerts</span>
            <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
          </div>
          <div className="mt-space-sm flex items-baseline justify-between">
            <span className="font-telemetry-display text-headline-lg text-secondary">{spokenCount}</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">TTS v2.1</span>
          </div>
          <div className="mt-space-xs w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full w-[24%]" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-caps text-label-caps uppercase">Driver Attention Flags</span>
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </div>
          <div className="mt-space-sm flex items-baseline justify-between">
            <span className="font-telemetry-display text-headline-lg text-error">
              {dmsFlags.toString().padStart(2, '0')}
            </span>
            <span className="font-label-caps text-label-caps text-error bg-error-container/20 px-1 rounded">
              MONITORED
            </span>
          </div>
          <div className="mt-space-xs w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
            <div className="bg-error h-full w-[12%]" />
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-caps text-label-caps uppercase">Verified / Buffer</span>
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <div className="mt-space-sm flex items-baseline justify-between">
            <span className="font-telemetry-display text-headline-lg text-on-surface">
              {totalEvents} <span className="font-telemetry-unit text-telemetry-unit text-outline">/ 200</span>
            </span>
            <span className="font-label-caps text-label-caps text-tertiary">RING BUFFER</span>
          </div>
          <div className="mt-space-xs w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden flex">
            <div className="bg-tertiary h-full" style={{ width: `${Math.min(100, (totalEvents / 200) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm flex-1 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              placeholder="Search audit events by keyword, alert, or payload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container pl-10 pr-4 py-2 rounded-lg text-xs font-body-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-space-xs flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-container text-xs font-label-caps px-3 py-2 rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="ADVISORY">ADVISORY</option>
            <option value="INFO">INFO</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-surface-container text-xs font-label-caps px-3 py-2 rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="ALL">ALL SOURCES</option>
            <option value="TRAFFIC_VISION">TRAFFIC VISION</option>
            <option value="DRIVER_MONITOR">DRIVER MONITOR</option>
            <option value="ROAD_CONTEXT">ROAD CONTEXT</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Full Audit Table */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/30 font-label-caps text-[11px] text-outline uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Source Subsystem</th>
                <th className="py-3 px-4">Event Title &amp; Details</th>
                <th className="py-3 px-4 text-center">Spoken Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs font-body-sm">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-outline">
                    No historical events match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-surface-container/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-outline whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-label-caps text-[10px] px-2 py-0.5 rounded font-bold ${
                          ev.category === 'CRITICAL'
                            ? 'bg-error-container text-on-error'
                            : ev.category === 'WARNING'
                            ? 'bg-secondary-container/40 text-secondary'
                            : ev.category === 'ADVISORY'
                            ? 'bg-primary-container/30 text-primary'
                            : 'bg-surface-container-high text-tertiary'
                        }`}
                      >
                        {ev.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-primary whitespace-nowrap">
                      {ev.source}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface">{ev.title}</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">{ev.message}</div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {ev.spoken ? (
                        <span className="material-symbols-outlined text-[18px] text-tertiary" title="Spoken by TTS">
                          record_voice_over
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-outline" title="Silent / In-dash">
                          volume_off
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
