'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Network, ShieldAlert, Eye, SlidersHorizontal, Power } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { SwitchNodeData } from '@/types/network';

export const SwitchNode = memo(({ id, data, selected }: NodeProps) => {
  const switchData = data as unknown as SwitchNodeData;
  const edges = useNetworkStore((s) => s.edges);
  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const setIsolatedDeviceId = useNetworkStore((s) => s.setIsolatedDeviceId);
  const openDeviceInspector = useNetworkStore((s) => s.openDeviceInspector);
  const toggleDevicePower = useNetworkStore((s) => s.toggleDevicePower);
  const isEnvelopeMode = useNetworkStore((s) => s.isEnvelopeMode);
  const envelopeSourceId = useNetworkStore((s) => s.envelopeSourceId);
  const isEnvelopeSource = envelopeSourceId === id;

  const isPoweredOn = switchData.isPoweredOn ?? true;
  const connectedCount = edges.filter((e) => e.source === id || e.target === id).length;
  const maxPorts = switchData.maxPorts || 24;
  const isFull = connectedCount >= maxPorts;
  const isIsolated = isolatedDeviceId === id;
  const isDimmed =
    isolatedDeviceId !== null &&
    !isIsolated &&
    !edges.some(
      (e) => (e.source === isolatedDeviceId && e.target === id) || (e.target === isolatedDeviceId && e.source === id)
    );

  const usagePercent = Math.min(100, Math.round((connectedCount / maxPorts) * 100));
  const portIndicators = Array.from({ length: Math.min(maxPorts, 48) }, (_, i) => i < connectedCount);

  return (
    <div
      onDoubleClick={() => openDeviceInspector(id)}
      className={`relative min-w-[240px] rounded-xl border-2 transition-all duration-200 bg-slate-900/95 shadow-2xl backdrop-blur-md text-slate-100 select-none ${
        isEnvelopeSource
          ? 'border-cyan-400 ring-4 ring-cyan-400/80 shadow-cyan-400/50 animate-pulse'
          : isEnvelopeMode
          ? 'border-cyan-500/60 hover:border-cyan-400 cursor-pointer ring-1 ring-cyan-400/30'
          : !isPoweredOn
          ? 'border-slate-800 opacity-60 bg-slate-950'
          : isIsolated
          ? 'border-cyan-400 ring-4 ring-cyan-500/40 shadow-cyan-500/30'
          : selected
          ? 'border-cyan-400 ring-2 ring-cyan-400/30'
          : isFull
          ? 'border-rose-500/80 shadow-rose-500/20'
          : 'border-slate-700/80 hover:border-slate-500'
      } ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
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

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 tracking-wide truncate max-w-[100px]">{switchData.label}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {!isPoweredOn ? 'Apagado' : switchData.ip || 'Cisco Catalyst'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botón de aislamiento */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsolatedDeviceId(id);
            }}
            title={isIsolated ? 'Quitar aislamiento' : 'Aislar cableado'}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1 border ${
              isIsolated
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{isIsolated ? 'Aislado' : 'Aislar'}</span>
          </button>

          {/* Configuración / CLI */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeviceInspector(id);
            }}
            title="Abrir Consola CLI Cisco / VLANs"
            className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cuerpo y Capacidad */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            {isFull && <ShieldAlert className="w-3.5 h-3.5 text-rose-400 inline animate-pulse" />}
            Puertos Usados:
          </span>
          <span className={`font-mono font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
            {connectedCount} / {maxPorts}P
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isFull ? 'bg-rose-500' : usagePercent > 80 ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>

        {/* Rejilla de LEDs */}
        <div className="pt-1">
          <div className="grid grid-cols-12 gap-1 p-1.5 bg-slate-950/80 rounded-md border border-slate-800/60">
            {portIndicators.map((active, i) => (
              <div
                key={i}
                title={`Puerto ${i + 1}: ${active && isPoweredOn ? 'Conectado (Link Up)' : 'Disponible'}`}
                className={`w-2 h-2 rounded-[2px] transition-colors ${
                  active && isPoweredOn
                    ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                    : 'bg-slate-800 border border-slate-700/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer con Power y VLAN */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDevicePower(id);
            }}
            title={isPoweredOn ? 'Apagar switch' : 'Encender switch'}
            className={`flex items-center gap-1 font-semibold transition-colors ${
              isPoweredOn ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isPoweredOn ? 'ON' : 'OFF'}</span>
          </button>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
            {switchData.vlan || 'VLAN 1'}
          </span>
        </div>
      </div>
    </div>
  );
});

SwitchNode.displayName = 'SwitchNode';
