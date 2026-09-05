'use client';

import React from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';

export const AlertToast: React.FC = () => {
  const alertMessage = useNetworkStore((s) => s.alertMessage);
  const dismissAlert = useNetworkStore((s) => s.dismissAlert);

  if (!alertMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top-4 fade-in duration-200 pointer-events-auto">
      <div className="bg-rose-950/95 border-2 border-rose-500 rounded-2xl p-4 shadow-2xl shadow-rose-950/80 backdrop-blur-md flex items-start gap-3 text-slate-100">
        <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1 text-xs leading-relaxed">
          <div className="font-bold text-rose-200 text-sm mb-0.5">Aviso de Configuración de Red</div>
          <p className="text-slate-300 font-medium">{alertMessage}</p>
        </div>
        <button
          onClick={dismissAlert}
          className="p-1 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
