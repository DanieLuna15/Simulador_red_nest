'use client';

import React, { useState } from 'react';
import { Calculator, X, Network, Hash, Layers } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';

export const SubnetCalculatorModal: React.FC = () => {
  const isSubnetCalcOpen = useNetworkStore((s) => s.isSubnetCalcOpen);
  const setIsSubnetCalcOpen = useNetworkStore((s) => s.setIsSubnetCalcOpen);

  const [baseIp, setBaseIp] = useState('192.168.10.0');
  const [cidr, setCidr] = useState(24);

  if (!isSubnetCalcOpen) return null;

  // Cálculos IPv4
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = Math.max(0, totalHosts - 2);

  const getSubnetMask = (prefix: number) => {
    let mask = '';
    for (let i = 0; i < 4; i++) {
      const n = Math.min(prefix, 8);
      mask += (256 - Math.pow(2, 8 - n)).toString();
      prefix -= n;
      if (i < 3) mask += '.';
    }
    return mask;
  };

  const subnetMask = getSubnetMask(cidr);

  // Subredes sugeridas
  const parts = baseIp.split('.').map(Number);
  const basePrefix = parts.slice(0, 3).join('.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Calculadora de Subredes IPv4 / VLSM</h2>
              <p className="text-xs text-slate-400">Planificación de direccionamiento CIDR para tu red</p>
            </div>
          </div>
          <button
            onClick={() => setIsSubnetCalcOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Dirección IP de Red Base:
              </label>
              <input
                type="text"
                value={baseIp}
                onChange={(e) => setBaseIp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
                placeholder="192.168.10.0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prefijo CIDR: <strong className="text-cyan-400 font-mono">/{cidr}</strong>
              </label>
              <select
                value={cidr}
                onChange={(e) => setCidr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                {[24, 25, 26, 27, 28, 29, 30].map((c) => (
                  <option key={c} value={c}>
                    /{c} ({Math.pow(2, 32 - c) - 2} Hosts útiles)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tarjetas de resultados */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Máscara Subred</div>
              <div className="text-xs font-mono font-bold text-cyan-400 mt-1">{subnetMask}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hosts Disponibles</div>
              <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
                {usableHosts.toLocaleString()} equipos
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Rango Primer Host</div>
              <div className="text-xs font-mono font-bold text-amber-400 mt-1">{basePrefix}.1</div>
            </div>
          </div>

          {/* Segmentación Departamental Sugerida */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Segmentación Sugerida para las Oficinas (VLANs)
            </h4>
            <div className="space-y-1.5">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-sans font-medium">🎧 VLAN 10 - Call Center (8 PCs)</span>
                <span className="text-cyan-400">{basePrefix}.0/27 (Hosts .1 a .30)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-sans font-medium">📞 VLAN 20 - Telefonía VoIP</span>
                <span className="text-amber-400">{basePrefix}.32/27 (Hosts .33 a .62)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-sans font-medium">📊 VLAN 30 - Administración & Gerencia</span>
                <span className="text-emerald-400">{basePrefix}.64/27 (Hosts .65 a .94)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-sans font-medium">🏢 VLAN 99 - Servidores & Gestión Rack</span>
                <span className="text-purple-400">{basePrefix}.96/28 (Hosts .97 a .110)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setIsSubnetCalcOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
