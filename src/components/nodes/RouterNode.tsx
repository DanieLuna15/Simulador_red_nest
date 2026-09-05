'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Route, Globe, Eye, Shield, Radio, Cloud, SlidersHorizontal, Power } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { RouterNodeData } from '@/types/network';

export const RouterNode = memo(({ id, data, selected }: NodeProps) => {
  const routerData = data as unknown as RouterNodeData;
  const edges = useNetworkStore((s) => s.edges);
  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const setIsolatedDeviceId = useNetworkStore((s) => s.setIsolatedDeviceId);
  const openDeviceInspector = useNetworkStore((s) => s.openDeviceInspector);
  const toggleDevicePower = useNetworkStore((s) => s.toggleDevicePower);
  const isEnvelopeMode = useNetworkStore((s) => s.isEnvelopeMode);
  const envelopeSourceId = useNetworkStore((s) => s.envelopeSourceId);
  const isEnvelopeSource = envelopeSourceId === id;

  const isPoweredOn = routerData.isPoweredOn ?? true;
  const isIsolated = isolatedDeviceId === id;
  const isDimmed =
    isolatedDeviceId !== null &&
    !isIsolated &&
    !edges.some(
      (e) => (e.source === isolatedDeviceId && e.target === id) || (e.target === isolatedDeviceId && e.source === id)
    );

  const connectedCount = edges.filter((e) => e.source === id || e.target === id).length;

  const getPerimeterIcon = () => {
    switch (routerData.deviceType) {
      case 'firewall':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'ont':
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case 'cloud':
        return <Cloud className="w-4 h-4 text-sky-400" />;
      case 'router':
      default:
        return <Route className="w-4 h-4 text-amber-400" />;
    }
  };

  const borderColor =
    routerData.deviceType === 'firewall'
      ? 'border-rose-500/40'
      : routerData.deviceType === 'cloud'
      ? 'border-sky-500/40'
      : 'border-amber-500/40';

  return (
    <div
      onDoubleClick={() => openDeviceInspector(id)}
      className={`relative min-w-[220px] rounded-2xl border-2 transition-all duration-200 bg-slate-900/95 shadow-2xl backdrop-blur-md text-slate-100 select-none ${
        isEnvelopeSource
          ? 'border-cyan-400 ring-4 ring-cyan-400/80 shadow-cyan-400/50 animate-pulse'
          : isEnvelopeMode
          ? 'border-cyan-500/60 hover:border-cyan-400 cursor-pointer ring-1 ring-cyan-400/30'
          : !isPoweredOn
          ? 'border-slate-800 opacity-60 bg-slate-950'
          : isIsolated
          ? 'border-amber-400 ring-4 ring-amber-500/40 shadow-amber-500/30'
          : selected
          ? 'border-cyan-400 ring-2 ring-cyan-400/30'
          : `${borderColor} hover:border-slate-500`
      } ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
    >
      {/* Indicador de Origen en Modo Sobre ✉️ */}
      {isEnvelopeSource && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-[9px] shadow-lg flex items-center gap-1 z-30 animate-bounce">
          <span>✉️ ORIGEN</span>
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
            {getPerimeterIcon()}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 truncate max-w-[95px]">{routerData.label}</div>
            <div className="text-[10px] text-amber-400 font-mono">
              {!isPoweredOn ? 'Apagado' : routerData.ip || '192.168.1.1'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsolatedDeviceId(id);
            }}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1 border ${
              isIsolated
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{isIsolated ? 'Aislado' : 'Aislar'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeviceInspector(id);
            }}
            title="Configurar Router / Firewall"
            className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            {routerData.deviceType === 'firewall' ? 'Inspección UTM:' : 'Gateway WAN:'}
          </span>
          <span className="font-mono text-slate-200">
            {routerData.deviceType === 'firewall' ? 'Activa (14 Reglas)' : routerData.gateway || 'Fibra Óptica'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDevicePower(id);
            }}
            className={`flex items-center gap-1 font-semibold transition-colors ${
              isPoweredOn ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isPoweredOn ? 'ON' : 'OFF'}</span>
          </button>

          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">
            {connectedCount} enlaces
          </span>
        </div>
      </div>
    </div>
  );
});

RouterNode.displayName = 'RouterNode';
