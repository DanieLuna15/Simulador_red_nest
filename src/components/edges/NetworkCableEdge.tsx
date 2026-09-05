'use client';

import React, { memo, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { CableEdgeData, CableType } from '@/types/network';

interface TravelingPacketProps {
  pathRef: React.RefObject<SVGPathElement | null>;
  direction?: 'forward' | 'reverse';
  color?: string;
  label?: string;
  duration?: number;
}

/**
 * Componente de Sobre PDU ✉️ que viaja físicamente a lo largo de la curva Bezier del cable
 * utilizando requestAnimationFrame y la geometría exacta del SVGPathElement nativo.
 * Cero saltos, cero teletransporte, fluidez absoluta a 60/120 FPS.
 */
const TravelingPacket: React.FC<TravelingPacketProps> = ({
  pathRef,
  direction = 'forward',
  color = '#00f0ff',
  label = '✉️ PDU',
  duration = 1300,
}) => {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;

    const tick = (now: number) => {
      const pathEl = pathRef.current;
      if (!pathEl || !groupRef.current) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const totalLength = pathEl.getTotalLength();
      if (totalLength === 0) {
        animId = requestAnimationFrame(tick);
        return;
      }

      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Suavizado cuadrático easeInOut para aceleración y desaceleración elegante
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentDistance =
        direction === 'reverse' ? (1 - ease) * totalLength : ease * totalLength;

      const point = pathEl.getPointAtLength(currentDistance);

      groupRef.current.setAttribute(
        'transform',
        `translate(${point.x}, ${point.y})`
      );
      groupRef.current.style.opacity = '1';

      if (progress < 1) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [pathRef, direction, duration]);

  const pillWidth = Math.max((label?.length || 8) * 8 + 18, 76);

  return (
    <g
      ref={groupRef}
      style={{ opacity: 0 }}
      className="pointer-events-none select-none z-50"
    >
      {/* 1. Halo exterior difuso de alta energía */}
      <circle
        r="24"
        fill={color}
        opacity="0.32"
        filter={`drop-shadow(0 0 16px ${color})`}
      />
      {/* 2. Núcleo luminoso */}
      <circle r="9" fill={color} opacity="0.9" />
      <circle r="4" fill="#ffffff" />

      {/* 3. Sobre PDU 3D flotante sobre el cable */}
      <g transform="translate(-19, -38)">
        <rect
          width="38"
          height="26"
          rx="7"
          fill="#090d16"
          stroke={color}
          strokeWidth="2"
          filter="drop-shadow(0 6px 14px rgba(0,0,0,0.95))"
        />
        <text
          x="19"
          y="16"
          fontSize="16"
          textAnchor="middle"
          dominantBaseline="central"
        >
          ✉️
        </text>
      </g>

      {/* 4. Etiqueta descriptiva del paquete */}
      {label && (
        <g transform="translate(0, 20)">
          <rect
            x={-pillWidth / 2}
            y="-9"
            width={pillWidth}
            height="18"
            rx="9"
            fill="#020617"
            stroke={color}
            strokeWidth="1.4"
            opacity="0.95"
            filter="drop-shadow(0 3px 8px rgba(0,0,0,0.85))"
          />
          <text
            x="0"
            y="1"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            fill={color}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
};

/**
 * Paquete continuo para simulación de Tráfico en Vivo
 */
const LiveTrafficPacket: React.FC<{
  pathRef: React.RefObject<SVGPathElement | null>;
  color: string;
  speed?: number;
}> = ({ pathRef, color, speed = 2800 }) => {
  const groupRef = useRef<SVGGElement>(null);
  const offsetRef = useRef(Math.random() * speed);

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const pathEl = pathRef.current;
      if (!pathEl || !groupRef.current) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const totalLength = pathEl.getTotalLength();
      if (totalLength === 0) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const elapsed = (now + offsetRef.current) % speed;
      const progress = elapsed / speed;
      const point = pathEl.getPointAtLength(progress * totalLength);

      groupRef.current.setAttribute(
        'transform',
        `translate(${point.x}, ${point.y})`
      );
      groupRef.current.style.opacity = '1';

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [pathRef, speed]);

  return (
    <g ref={groupRef} style={{ opacity: 0 }} className="pointer-events-none select-none">
      <circle r="7" fill={color} opacity="0.35" filter={`drop-shadow(0 0 6px ${color})`} />
      <circle r="4" fill={color} />
      <circle r="2" fill="#ffffff" />
    </g>
  );
};

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
  const cableType: CableType = edgeData.cableType || 'utp-cat6';

  const isLiveTrafficActive = useNetworkStore((s) => s.isLiveTrafficActive);
  const animatingPackets = useNetworkStore((s) => s.animatingPackets);
  const activePacket = animatingPackets[id];
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

  // Ref para cálculo exacto de longitud y coordenadas a 60 FPS
  const measurePathRef = useRef<SVGPathElement>(null);

  // Configuración de estilo según tipo de cable
  const getCableConfig = (type: CableType) => {
    switch (type) {
      case 'utp-crossover':
        return {
          stroke: '#f97316',
          strokeWidth: isIsolatedMatch ? 3.5 : 2.5,
          strokeDasharray: '6,6',
          badgeText: '🔀 Crossover',
          badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
        };
      case 'fiber-sfp':
        return {
          stroke: '#facc15',
          strokeWidth: isIsolatedMatch ? 4 : 2.5,
          filter: `drop-shadow(0 0 8px #facc15)`,
          badgeText: '⚡ Fibra 10G',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        };
      case 'wireless':
        return {
          stroke: '#10b981',
          strokeWidth: 2,
          strokeDasharray: '4,6',
          badgeText: '📶 Wi-Fi 6',
          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 animate-pulse',
        };
      case 'serial-wan':
        return {
          stroke: '#ef4444',
          strokeWidth: isIsolatedMatch ? 3.5 : 2.5,
          badgeText: '⚡ Serial WAN',
          badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        };
      case 'utp-cat6':
      default:
        return {
          stroke: '#00f0ff',
          strokeWidth: isIsolatedMatch ? 3.5 : selected ? 3 : 2,
          badgeText: '🔌 UTP Cat6',
          badgeClass: 'bg-slate-950/80 text-cyan-300 border-cyan-500/30',
        };
    }
  };

  const config = getCableConfig(cableType);

  return (
    <>
      {/* Path nativo de medición en el DOM SVG para calcular la trayectoria en tiempo real */}
      <path
        ref={measurePathRef}
        d={edgePath}
        fill="none"
        stroke="none"
        className="pointer-events-none"
      />

      {/* Cable base con propiedades de conector */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: activePacket ? activePacket.color : config.stroke,
          strokeWidth: activePacket ? 4 : config.strokeWidth,
          strokeDasharray: config.strokeDasharray,
          filter: activePacket ? `drop-shadow(0 0 12px ${activePacket.color})` : config.filter,
          opacity: isDimmed ? 0.06 : 1,
          transition: 'all 0.3s ease',
        }}
        className={
          edgeData.animated || isLiveTrafficActive || cableType === 'fiber-sfp' || cableType === 'wireless'
            ? 'animate-pulse'
            : ''
        }
      />

      {/* Resplandor óptico y haz de datos adicional mientras viaja un paquete */}
      {activePacket && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke={activePacket.color}
            strokeWidth={7}
            opacity={0.35}
            filter={`drop-shadow(0 0 10px ${activePacket.color})`}
            className="pointer-events-none"
          />
          <path
            d={edgePath}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeDasharray="14,20"
            className="pointer-events-none animate-pulse"
          />
        </>
      )}

      {/* Sobre PDU ✉️ viajando en simulación activa a 60 FPS */}
      {activePacket && (
        <TravelingPacket
          pathRef={measurePathRef}
          direction={activePacket.direction}
          color={activePacket.color}
          label={activePacket.label}
          duration={activePacket.duration || 1300}
        />
      )}

      {/* Paquete PDU continuo cuando Tráfico en Vivo está activo */}
      {isLiveTrafficActive && !isDimmed && !activePacket && (
        <LiveTrafficPacket
          pathRef={measurePathRef}
          color={config.stroke}
          speed={2600}
        />
      )}

      {/* Badge central interactivo */}
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
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider border shadow-md flex items-center gap-1 backdrop-blur-md transition-all select-none ${
                config.badgeClass
              } ${selected ? 'ring-2 ring-white scale-110' : ''}`}
            >
              <span>{config.badgeText}</span>
              <span className="text-[8px] opacity-75">{edgeData.speed || '1G'}</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

NetworkCableEdge.displayName = 'NetworkCableEdge';
