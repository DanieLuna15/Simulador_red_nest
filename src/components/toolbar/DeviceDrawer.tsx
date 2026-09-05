'use client';

import React, { useState } from 'react';
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
  Cable,
  Shield,
  Radio,
  Cloud,
  Smartphone,
  Printer,
  Camera,
  Cpu,
  Database,
  HardDrive,
  Globe,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { DeviceType, CableType } from '@/types/network';

interface DeviceItem {
  type: DeviceType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const CABLES: Array<{ type: CableType; label: string; iconText: string; color: string }> = [
  { type: 'auto', label: 'Automático', iconText: '⚡', color: 'text-cyan-400' },
  { type: 'utp-cat6', label: 'UTP Directo', iconText: '🔌', color: 'text-cyan-400' },
  { type: 'utp-crossover', label: 'Cruzado', iconText: '🔀', color: 'text-orange-400' },
  { type: 'fiber-sfp', label: 'Fibra 10G', iconText: '✨', color: 'text-amber-400' },
  { type: 'wireless', label: 'Wi-Fi 6', iconText: '📶', color: 'text-emerald-400' },
  { type: 'serial-wan', label: 'Serial WAN', iconText: '⚡', color: 'text-rose-400' },
];

export const DeviceDrawer: React.FC = () => {
  const addDevice = useNetworkStore((s) => s.addDevice);
  const activeCableType = useNetworkStore((s) => s.activeCableType);
  const setActiveCableType = useNetworkStore((s) => s.setActiveCableType);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    cables: true,
    switches: true,
    perimeter: true,
    servers: true,
    workstations: true,
    tools: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const switchesList: DeviceItem[] = [
    { type: 'switch-48', label: 'Switch 48P L2+ PoE', icon: <Network className="w-4 h-4" />, color: 'text-cyan-400' },
    { type: 'switch-24', label: 'Switch 24P Gigabit', icon: <Network className="w-4 h-4" />, color: 'text-cyan-400' },
    { type: 'switch-16', label: 'Switch 16P PoE+', icon: <Network className="w-4 h-4" />, color: 'text-cyan-400' },
    { type: 'switch-8', label: 'Switch 8P Compacto', icon: <Network className="w-4 h-4" />, color: 'text-cyan-400' },
    { type: 'hub-5', label: 'Hub Ethernet 5P', icon: <Network className="w-4 h-4" />, color: 'text-slate-400' },
  ];

  const perimeterList: DeviceItem[] = [
    { type: 'router', label: 'Router MikroTik CCR', icon: <Route className="w-4 h-4" />, color: 'text-amber-400' },
    { type: 'firewall', label: 'Firewall Fortinet UTM', icon: <Shield className="w-4 h-4" />, color: 'text-rose-400' },
    { type: 'ont', label: 'Módem ONT AXS Fibra', icon: <Radio className="w-4 h-4" />, color: 'text-emerald-400' },
    { type: 'cloud', label: 'Nube WAN Internet', icon: <Cloud className="w-4 h-4" />, color: 'text-sky-400' },
  ];

  const serversList: DeviceItem[] = [
    { type: 'server-web', label: 'Servidor Web HTTP', icon: <Globe className="w-4 h-4" />, color: 'text-cyan-400' },
    { type: 'server-dns', label: 'Servidor DNS / DHCP', icon: <Server className="w-4 h-4" />, color: 'text-indigo-400' },
    { type: 'server-db', label: 'Servidor SQL Data', icon: <Database className="w-4 h-4" />, color: 'text-purple-400' },
    { type: 'server-nas', label: 'Storage NAS Backup', icon: <HardDrive className="w-4 h-4" />, color: 'text-amber-400' },
  ];

  const endpointsList: DeviceItem[] = [
    { type: 'pc', label: 'PC Torre Escritorio', icon: <Monitor className="w-4 h-4" />, color: 'text-cyan-400' },
    { type: 'laptop', label: 'Laptop Wi-Fi', icon: <Laptop className="w-4 h-4" />, color: 'text-indigo-400' },
    { type: 'smartphone', label: 'Smartphone Móvil', icon: <Smartphone className="w-4 h-4" />, color: 'text-pink-400' },
    { type: 'phone', label: 'Teléfono VoIP', icon: <PhoneCall className="w-4 h-4" />, color: 'text-amber-400' },
    { type: 'printer', label: 'Impresora Multifuncional', icon: <Printer className="w-4 h-4" />, color: 'text-rose-400' },
    { type: 'camera', label: 'Cámara CCTV IP', icon: <Camera className="w-4 h-4" />, color: 'text-sky-400' },
    { type: 'ap', label: 'AP Wi-Fi 6 Mesh', icon: <Wifi className="w-4 h-4" />, color: 'text-emerald-400' },
    { type: 'iot', label: 'Sensor IoT Smart', icon: <Cpu className="w-4 h-4" />, color: 'text-yellow-400' },
  ];

  return (
    <aside className="w-72 bg-slate-950/95 border-r border-slate-800 p-3 flex flex-col gap-4 overflow-y-auto backdrop-blur-md z-10 select-none">
      {/* 1. Selector de Cable Activo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Cable className="w-3.5 h-3.5 text-cyan-400" />
          Medio de Conexión Activo
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {CABLES.map((c) => (
            <button
              key={c.type}
              onClick={() => setActiveCableType(c.type)}
              className={`p-2 rounded-lg text-[10px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                activeCableType === c.type
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20 scale-105'
                  : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-sm">{c.iconText}</span>
              <span className="truncate max-w-[65px]">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Switches & Hubs */}
      <div>
        <button
          onClick={() => toggleSection('switches')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            Switches & Hubs ({switchesList.length})
          </span>
          {openSections.switches ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {openSections.switches && (
          <div className="grid grid-cols-1 gap-1">
            {switchesList.map((dev) => (
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
        )}
      </div>

      {/* 3. Perímetro & Enrutamiento */}
      <div>
        <button
          onClick={() => toggleSection('perimeter')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-amber-400" />
            Perímetro & Seguridad ({perimeterList.length})
          </span>
          {openSections.perimeter ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {openSections.perimeter && (
          <div className="grid grid-cols-1 gap-1">
            {perimeterList.map((dev) => (
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
        )}
      </div>

      {/* 4. Servidores */}
      <div>
        <button
          onClick={() => toggleSection('servers')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            Servidores & Datos ({serversList.length})
          </span>
          {openSections.servers ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {openSections.servers && (
          <div className="grid grid-cols-1 gap-1">
            {serversList.map((dev) => (
              <button
                key={dev.type}
                onClick={() => addDevice(dev.type)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/40 text-slate-200 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${dev.color}`}>
                    {dev.icon}
                  </div>
                  <span className="text-xs font-medium">{dev.label}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Terminales & IoT */}
      <div>
        <button
          onClick={() => toggleSection('workstations')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-sky-400" />
            Terminales & IoT ({endpointsList.length})
          </span>
          {openSections.workstations ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {openSections.workstations && (
          <div className="grid grid-cols-1 gap-1">
            {endpointsList.map((dev) => (
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
        )}
      </div>

      {/* 6. Anotaciones & Zonas */}
      <div>
        <button
          onClick={() => toggleSection('tools')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-200"
        >
          <span className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-yellow-400" />
            Anotaciones & Zonas
          </span>
          {openSections.tools ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {openSections.tools && (
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => addDevice('text-note')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-yellow-500/40 text-slate-200 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-yellow-400">
                  <Type className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Nota con Color</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
            </button>
            <button
              onClick={() => addDevice('zone')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-blue-500/40 text-slate-200 transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-blue-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Área de Oficina</span>
              </div>
              <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
