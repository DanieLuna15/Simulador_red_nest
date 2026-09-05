'use client';

import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { Building2 } from 'lucide-react';
import { ZoneNodeData } from '@/types/network';

export const ZoneNode = memo(({ data, selected }: NodeProps) => {
  const zoneData = data as unknown as ZoneNodeData;
  const color = zoneData.color || '#3b82f6';
  const width = zoneData.width || 400;
  const height = zoneData.height || 260;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderColor: color,
      }}
      className={`relative rounded-2xl border-2 border-dashed bg-slate-950/40 backdrop-blur-[2px] transition-colors p-3 pointer-events-none ${
        selected ? 'ring-2 ring-cyan-400 border-solid' : ''
      }`}
    >
      {/* Resizer de React Flow cuando está seleccionado */}
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        lineClassName="!border-cyan-400"
        handleClassName="!w-3 !h-3 !bg-cyan-400 !border-2 !border-slate-900 !rounded-full"
      />

      {/* Header de la Zona */}
      <div
        style={{ backgroundColor: `${color}15`, borderColor: `${color}40`, color: color }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wider uppercase pointer-events-auto select-none"
      >
        <Building2 className="w-4 h-4" />
        <span>{zoneData.label}</span>
      </div>
    </div>
  );
});

ZoneNode.displayName = 'ZoneNode';
