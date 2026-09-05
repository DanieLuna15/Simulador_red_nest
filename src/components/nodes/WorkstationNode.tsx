'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Monitor, Laptop, Server, PhoneCall, Wifi, Trash2 } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { WorkstationNodeData } from '@/types/network';

export const WorkstationNode = memo(({ id, data, selected }: NodeProps) => {
  const wsData = data as unknown as WorkstationNodeData;
  const edges = useNetworkStore((s) => s.edges);
  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const removeNode = useNetworkStore((s) => s.removeNode);

  const isDimmed =
    isolatedDeviceId !== null &&
    !edges.some(
      (e) => (e.source === isolatedDeviceId && e.target === id) || (e.target === isolatedDeviceId && e.source === id)
    );

  const isConnected = edges.some((e) => e.source === id || e.target === id);

  const getDeviceIcon = () => {
    switch (wsData.deviceType) {
      case 'laptop':
        return <Laptop className="w-5 h-5 text-indigo-400" />;
      case 'server':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'phone':
        return <PhoneCall className="w-5 h-5 text-amber-400" />;
      case 'ap':
        return <Wifi className="w-5 h-5 text-emerald-400" />;
      case 'pc':
      default:
        return <Monitor className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`relative min-w-[170px] rounded-xl border-2 transition-all duration-200 bg-slate-900/95 shadow-xl backdrop-blur-md text-slate-100 ${
        selected
          ? 'border-cyan-400 ring-2 ring-cyan-400/30'
          : 'border-slate-800 hover:border-slate-600'
      } ${isDimmed ? 'opacity-20 grayscale' : 'opacity-100'}`}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-950" />

      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
              {getDeviceIcon()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 leading-tight">{wsData.label}</div>
              <div className="text-[10px] text-cyan-400 font-mono">{wsData.ip || 'DHCP'}</div>
            </div>
          </div>

          {/* Indicador de estado de enlace */}
          <div
            title={isConnected ? 'Enlace activo (Link UP)' : 'Sin cable conectado'}
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
            }`}
          />
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
          <span className="font-mono truncate max-w-[100px]">{wsData.mac || 'Auto-ARP'}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
            {wsData.vlan || 'VLAN 10'}
          </span>
        </div>
      </div>
    </div>
  );
});

WorkstationNode.displayName = 'WorkstationNode';
