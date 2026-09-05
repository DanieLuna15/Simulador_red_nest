'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Route, Globe, Eye } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { RouterNodeData } from '@/types/network';

export const RouterNode = memo(({ id, data, selected }: NodeProps) => {
  const routerData = data as unknown as RouterNodeData;
  const edges = useNetworkStore((s) => s.edges);
  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const setIsolatedDeviceId = useNetworkStore((s) => s.setIsolatedDeviceId);

  const isIsolated = isolatedDeviceId === id;
  const isDimmed =
    isolatedDeviceId !== null &&
    !isIsolated &&
    !edges.some(
      (e) => (e.source === isolatedDeviceId && e.target === id) || (e.target === isolatedDeviceId && e.source === id)
    );

  const connectedCount = edges.filter((e) => e.source === id || e.target === id).length;

  return (
    <div
      className={`relative min-w-[210px] rounded-2xl border-2 transition-all duration-200 bg-slate-900/95 shadow-2xl backdrop-blur-md text-slate-100 ${
        isIsolated
          ? 'border-amber-400 ring-4 ring-amber-500/40 shadow-amber-500/30'
          : selected
          ? 'border-cyan-400 ring-2 ring-cyan-400/30'
          : 'border-slate-700/80 hover:border-slate-500'
      } ${isDimmed ? 'opacity-25 grayscale' : 'opacity-100'}`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-slate-950" />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/70 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Route className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100">{routerData.label}</div>
            <div className="text-[10px] text-amber-400 font-mono">{routerData.ip || '192.168.1.1'}</div>
          </div>
        </div>

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
      </div>

      {/* Info Body */}
      <div className="p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Gateway WAN:
          </span>
          <span className="font-mono text-slate-200">{routerData.gateway || 'Fibra Óptica'}</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
          <span className="truncate max-w-[130px]">{routerData.model || 'MikroTik CCR'}</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">
            {connectedCount} enlaces activos
          </span>
        </div>
      </div>
    </div>
  );
});

RouterNode.displayName = 'RouterNode';
