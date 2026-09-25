import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
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

  const getStyle = () => {
    switch (alert.category) {
      case 'CRITICAL':
        return {
          card: 'bg-red-950/80 border-red-500/80 text-red-200 animate-pulse-critical',
          badge: 'bg-red-500 text-black font-extrabold',
          icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
        };
      case 'WARNING':
        return {
          card: 'bg-amber-950/80 border-amber-500/80 text-amber-200 animate-pulse-warning',
          badge: 'bg-amber-500 text-black font-extrabold',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        };
      case 'ADVISORY':
        return {
          card: 'bg-blue-950/80 border-blue-500/80 text-blue-200 glow-cyan',
          badge: 'bg-blue-500 text-black font-extrabold',
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        };
      default:
        return {
          card: 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200',
          badge: 'bg-emerald-500 text-black font-extrabold',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between gap-3 ${style.card}`}>
      <div className="flex items-center gap-3">
        {style.icon}
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded tracking-wider uppercase font-mono ${style.badge}`}>
              {alert.category}
            </span>
            <span className="font-bold text-sm tracking-wide text-white uppercase">{alert.title}</span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">{alert.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {alert.action_required && (
          <span className="hidden md:inline-block text-xs font-mono font-semibold px-2 py-1 rounded bg-black/40 border border-white/20 text-white">
            ACTION: {alert.action_required}
          </span>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs font-mono px-2 py-1 rounded bg-black/30 hover:bg-black/60 text-slate-300 transition-colors"
          >
            DISMISS
          </button>
        )}
      </div>
    </div>
  );
};
