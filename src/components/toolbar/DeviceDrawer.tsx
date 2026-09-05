'use client';

import React from 'react';
import {
  Network,
  Route,
  Monitor,
  Laptop,
  Server,
  PhoneCall,
  Wifi,
  Type,
  Building2,
  Plus,
} from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { DeviceType } from '@/types/network';

interface DeviceOption {
  type: DeviceType;
  label: string;
  icon: React.ReactNode;
  category: 'switches' | 'routers' | 'workstations' | 'tools';
  color: string;
}

const DEVICES: DeviceOption[] = [
  // Switches
  { type: 'switch-48', label: 'Switch 48P L2+', icon: <Network className="w-4 h-4" />, category: 'switches', color: 'text-cyan-400' },
  { type: 'switch-24', label: 'Switch 24P PoE+', icon: <Network className="w-4 h-4" />, category: 'switches', color: 'text-cyan-400' },
  { type: 'switch-16', label: 'Switch 16P PoE', icon: <Network className="w-4 h-4" />, category: 'switches', color: 'text-cyan-400' },

  // Routers
  { type: 'router', label: 'Router MikroTik', icon: <Route className="w-4 h-4" />, category: 'routers', color: 'text-amber-400' },

  // Workstations
  { type: 'pc', label: 'PC Escritorio', icon: <Monitor className="w-4 h-4" />, category: 'workstations', color: 'text-sky-400' },
  { type: 'laptop', label: 'Laptop Portátil', icon: <Laptop className="w-4 h-4" />, category: 'workstations', color: 'text-indigo-400' },
  { type: 'server', label: 'Servidor Datos', icon: <Server className="w-4 h-4" />, category: 'workstations', color: 'text-purple-400' },
  { type: 'phone', label: 'Teléfono VoIP', icon: <PhoneCall className="w-4 h-4" />, category: 'workstations', color: 'text-amber-400' },
  { type: 'ap', label: 'AP Wi-Fi 6', icon: <Wifi className="w-4 h-4" />, category: 'workstations', color: 'text-emerald-400' },

  // Herramientas / Anotaciones
  { type: 'text-note', label: 'Nota con Color', icon: <Type className="w-4 h-4" />, category: 'tools', color: 'text-yellow-400' },
  { type: 'zone', label: 'Área de Oficina', icon: <Building2 className="w-4 h-4" />, category: 'tools', color: 'text-blue-400' },
];

export const DeviceDrawer: React.FC = () => {
  const addDevice = useNetworkStore((s) => s.addDevice);

  return (
    <aside className="w-64 bg-slate-950/95 border-r border-slate-800 p-4 flex flex-col gap-5 overflow-y-auto backdrop-blur-md z-10 select-none">
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          Switches Administrables
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {DEVICES.filter((d) => d.category === 'switches').map((dev) => (
            <button
              key={dev.type}
              onClick={() => addDevice(dev.type)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 text-slate-200 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${dev.color}`}>
                  {dev.icon}
                </div>
                <span className="text-xs font-medium">{dev.label}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-amber-400" />
          Perímetro & Enrutamiento
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {DEVICES.filter((d) => d.category === 'routers').map((dev) => (
            <button
              key={dev.type}
              onClick={() => addDevice(dev.type)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-500/40 text-slate-200 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${dev.color}`}>
                  {dev.icon}
                </div>
                <span className="text-xs font-medium">{dev.label}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5 text-sky-400" />
          Terminales & Puestos
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {DEVICES.filter((d) => d.category === 'workstations').map((dev) => (
            <button
              key={dev.type}
              onClick={() => addDevice(dev.type)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-500/40 text-slate-200 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${dev.color}`}>
                  {dev.icon}
                </div>
                <span className="text-xs font-medium">{dev.label}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-yellow-400" />
          Anotaciones & Zonas
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {DEVICES.filter((d) => d.category === 'tools').map((dev) => (
            <button
              key={dev.type}
              onClick={() => addDevice(dev.type)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-yellow-500/40 text-slate-200 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${dev.color}`}>
                  {dev.icon}
                </div>
                <span className="text-xs font-medium">{dev.label}</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Tip de uso */}
      <div className="mt-auto p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 text-[11px] text-slate-400 leading-relaxed">
        💡 <strong>Tip de Cableado:</strong> Arrastra desde el círculo azul de un equipo hacia otro para tender un cable Cat6 o Fibra SFP+.
      </div>
    </aside>
  );
};
