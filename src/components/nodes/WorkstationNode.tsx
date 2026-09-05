'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Monitor,
  Laptop,
  Server,
  PhoneCall,
  Wifi,
  Smartphone,
  Printer,
  Camera,
  Cpu,
  Power,
  SlidersHorizontal,
} from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { BaseDeviceData } from '@/types/network';

export const WorkstationNode = memo(({ id, data, selected }: NodeProps) => {
  const wsData = data as unknown as BaseDeviceData;
  const edges = useNetworkStore((s) => s.edges);
  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const openDeviceInspector = useNetworkStore((s) => s.openDeviceInspector);
  const toggleDevicePower = useNetworkStore((s) => s.toggleDevicePower);
  const activeVlanFilter = useNetworkStore((s) => s.activeVlanFilter);
  const isEnvelopeMode = useNetworkStore((s) => s.isEnvelopeMode);
  const envelopeSourceId = useNetworkStore((s) => s.envelopeSourceId);
  const isEnvelopeSource = envelopeSourceId === id;

  const isPoweredOn = wsData.isPoweredOn ?? true;
  const isVlanFilteredOut =
    activeVlanFilter !== null &&
    (!wsData.vlan || !wsData.vlan.toLowerCase().includes(activeVlanFilter.toLowerCase()));

  const isDimmed =
    isVlanFilteredOut ||
    (isolatedDeviceId !== null &&
      !edges.some(
        (e) => (e.source === isolatedDeviceId && e.target === id) || (e.target === isolatedDeviceId && e.source === id)
      ));

  const isConnected = edges.some((e) => e.source === id || e.target === id);

  const getDeviceIcon = () => {
    switch (wsData.deviceType) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-sky-400" />;
      case 'smartphone':
        return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case 'server-web':
      case 'server-dns':
      case 'server-db':
      case 'server-nas':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'phone':
        return <PhoneCall className="w-5 h-5 text-amber-400" />;
      case 'printer':
        return <Printer className="w-5 h-5 text-rose-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-sky-400" />;
      case 'iot':
        return <Cpu className="w-5 h-5 text-yellow-400" />;
      case 'ap':
        return <Wifi className="w-5 h-5 text-emerald-400" />;
      case 'pc':
      default:
        return <Monitor className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div
      onDoubleClick={() => openDeviceInspector(id)}
      className={`relative min-w-[175px] rounded-xl border-2 transition-all duration-200 bg-slate-900/95 shadow-xl backdrop-blur-md text-slate-100 select-none ${
        isEnvelopeSource
          ? 'border-cyan-400 ring-4 ring-cyan-400/80 shadow-cyan-400/50 animate-pulse'
          : isEnvelopeMode
          ? 'border-cyan-500/60 hover:border-cyan-400 cursor-pointer ring-1 ring-cyan-400/30'
          : !isPoweredOn
          ? 'border-slate-800 opacity-60 bg-slate-950'
          : selected
          ? 'border-cyan-400 ring-2 ring-cyan-400/30'
          : 'border-slate-800 hover:border-slate-600'
      } ${isDimmed ? 'opacity-20 grayscale' : ''}`}
    >
      {/* Indicador de Origen en Modo Sobre ✉️ */}
      {isEnvelopeSource && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-[9px] shadow-lg flex items-center gap-1 z-30 animate-bounce">
          <span>✉️ ORIGEN</span>
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950" />

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-slate-950 border ${!isPoweredOn ? 'border-slate-800 opacity-50' : 'border-slate-800'}`}>
              {getDeviceIcon()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[95px]" title={wsData.label}>
                {wsData.label}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {!isPoweredOn ? 'Apagado' : wsData.ip || 'DHCP'}
              </div>
            </div>
          </div>

          {/* Botón de inspección / Configurar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeviceInspector(id);
            }}
            title="Abrir CLI / Configuración IP"
            className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Barra de estado y energía */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDevicePower(id);
            }}
            title={isPoweredOn ? 'Apagar equipo' : 'Encender equipo'}
            className={`flex items-center gap-1 font-semibold transition-colors ${
              isPoweredOn ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isPoweredOn ? 'ON' : 'OFF'}</span>
          </button>

          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold font-mono">
            {wsData.vlan || 'VLAN 10'}
          </span>

          {/* Link status LED */}
          <div
            title={
              !isPoweredOn
                ? 'Equipo apagado (Sin link)'
                : isConnected
                ? 'Enlace activo (Link UP)'
                : 'Sin cable conectado'
            }
            className={`w-2 h-2 rounded-full ${
              !isPoweredOn
                ? 'bg-slate-700'
                : isConnected
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
            }`}
          />
        </div>
      </div>
    </div>
  );
});

WorkstationNode.displayName = 'WorkstationNode';
