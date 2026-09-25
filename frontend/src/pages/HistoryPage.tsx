import React, { useState, useMemo } from 'react';
import { FileText, Search, Download, Printer, Trash2, Filter } from 'lucide-react';
import type { SafetyEvent } from '../types';

interface HistoryPageProps {
  events: SafetyEvent[];
  onClearEvents: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ events, onClearEvents }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, _setSeverityFilter] = useState<string>('ALL');

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
      const matchSev =
        severityFilter === 'ALL' ||
        (severityFilter === 'CRITICAL' && e.category === 'CRITICAL') ||
        (severityFilter === 'WARNING' && e.category === 'WARNING') ||
        (severityFilter === 'ADVISORY' && e.category === 'ADVISORY');
      return matchSearch && matchCat && matchSev;
    });
  }, [events, searchTerm, categoryFilter, severityFilter]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['TIME', 'EVENT', 'CONFIDENCE', 'LOCATION', 'ALERT', 'DRIVER_STATE', 'DETAILS'];
    const rows = filteredEvents.map((e) => [
      `"${new Date(e.timestamp).toISOString()}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      e.confidence ? `${Math.round(e.confidence * 100)}%` : '95%',
      '"Leopoldstraße / A99"',
      e.category,
      '"ATTENTIVE"',
      `"${e.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roadguard_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-accent" />
          <h1 className="font-headline font-bold text-base text-text-primary uppercase tracking-tight">
            PERCEPTION &amp; TELEMETRY AUDIT
          </h1>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border">
            {events.length} ENTRIES
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleExportCSV}
            type="button"
            className="px-2.5 py-1 rounded surface-card hover:bg-surface-elevated text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            type="button"
            className="px-2.5 py-1 rounded surface-card hover:bg-surface-elevated text-text-primary flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PRINT</span>
          </button>
          <button
            onClick={onClearEvents}
            type="button"
            className="px-2.5 py-1 rounded bg-critical-subtle hover:bg-critical/20 text-critical border border-critical/30 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>FLUSH</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="surface-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event title, sign classification, or telemetry details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-secondary pl-8 pr-3 py-1.5 rounded border border-border text-text-primary placeholder:text-text-muted text-xs focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-muted text-[11px] uppercase flex items-center gap-1">
            <Filter className="w-3 h-3 text-accent" />
            CATEGORY:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-secondary px-2 py-1 rounded border border-border text-text-primary text-xs focus:outline-none focus:border-accent"
          >
            <option value="ALL">ALL CATEGORIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="ADVISORY">ADVISORY</option>
            <option value="INFO">INFO</option>
          </select>
        </div>
      </div>

      {/* Dense Telemetry Audit Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-secondary text-text-muted text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">EVENT</th>
                <th className="py-2.5 px-3">CONFIDENCE</th>
                <th className="py-2.5 px-3">LOCATION</th>
                <th className="py-2.5 px-3">ALERT</th>
                <th className="py-2.5 px-3">DRIVER STATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted text-xs font-mono">
                    NO TELEMETRY INCIDENTS RECORDED IN BUFFER
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const isCrit = ev.category === 'CRITICAL';
                  const isWarn = ev.category === 'WARNING';
                  const conf = ev.confidence ? Math.round(ev.confidence * 100) : 96;

                  return (
                    <tr
                      key={ev.id}
                      className="hover:bg-surface-secondary/70 transition-colors"
                    >
                      {/* TIME */}
                      <td className="py-2 px-3 text-text-muted text-[11px] whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false })}
                      </td>

                      {/* EVENT */}
                      <td className="py-2 px-3 font-headline font-semibold text-text-primary text-xs">
                        <div className="truncate max-w-[280px]" title={ev.title}>
                          {ev.title}
                        </div>
                      </td>

                      {/* CONFIDENCE */}
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-bold text-success text-xs">
                          {conf}%
                        </span>
                      </td>

                      {/* LOCATION */}
                      <td className="py-2 px-3 text-text-secondary text-[11px] whitespace-nowrap">
                        Leopoldstraße / A99
                      </td>

                      {/* ALERT */}
                      <td className="py-2 px-3 whitespace-nowrap">
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
                      </td>

                      {/* DRIVER STATE */}
                      <td className="py-2 px-3 text-text-secondary text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ev.source === 'DRIVER_MONITOR' && isCrit
                                ? 'bg-critical'
                                : 'bg-success'
                            }`}
                          />
                          <span>{ev.source === 'DRIVER_MONITOR' && isCrit ? 'DROWSY' : 'ATTENTIVE'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
