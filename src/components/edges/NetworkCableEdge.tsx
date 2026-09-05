'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { CableEdgeData } from '@/types/network';

export const NetworkCableEdge = memo((props: EdgeProps) => {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  } = props;

  const edgeData = ((data || {}) as unknown) as Partial<CableEdgeData>;
  const cableType = edgeData.cableType || 'utp-cat6';
  const isFiber = cableType === 'fiber-sfp';

  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const isIsolatedMatch =
    isolatedDeviceId !== null && (source === isolatedDeviceId || target === isolatedDeviceId);
  const isDimmed = isolatedDeviceId !== null && !isIsolatedMatch;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = isFiber ? '#f97316' : '#00f0ff';
  const strokeWidth = isIsolatedMatch ? 3.5 : selected ? 3 : isFiber ? 2.5 : 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          opacity: isDimmed ? 0.08 : 1,
          filter: isIsolatedMatch ? `drop-shadow(0 0 8px ${strokeColor})` : undefined,
          transition: 'all 0.3s ease',
        }}
        className={edgeData.animated || isFiber ? 'animate-pulse' : ''}
      />

      {/* Badge de velocidad / Tipo de cable en el centro */}
      {!isDimmed && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider border shadow-md flex items-center gap-1 backdrop-blur-md transition-all ${
                isFiber
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950/80 text-cyan-300 border-cyan-500/30'
              } ${selected ? 'ring-1 ring-white' : ''}`}
            >
              <span>{isFiber ? '⚡ SFP+' : '🔌 UTP'}</span>
              <span className="text-[8px] opacity-70">{edgeData.speed || '1G'}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

NetworkCableEdge.displayName = 'NetworkCableEdge';
