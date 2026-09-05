'use client';

import React, { memo, useState } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import {
  Building2,
  Layers,
  Trash2,
  Edit2,
  Check,
  Palette,
} from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { ZoneNodeData } from '@/types/network';

const PALETTE = ['#00f0ff', '#22c55e', '#a855f7', '#f59e0b', '#38bdf8', '#f43f5e'];

export const ZoneNode = memo(({ id, data, selected }: NodeProps) => {
  const zoneData = data as unknown as ZoneNodeData;
  const updateNodeData = useNetworkStore((s) => s.updateNodeData);
  const toggleZoneLayer = useNetworkStore((s) => s.toggleZoneLayer);
  const removeNode = useNetworkStore((s) => s.removeNode);

  const color = zoneData.color || '#00f0ff';
  const width = Math.max(200, zoneData.width || 400);
  const height = Math.max(140, zoneData.height || 260);
  // Por defecto siempre debajo de cables y equipos
  const isBackground = zoneData.isBackground !== false;

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(zoneData.label || 'Área Departamental');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Redimensionado manual por arrastre desde la esquina inferior derecha
  const handleCornerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;

    const onMouseMove = (moveEv: MouseEvent) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      const newW = Math.max(200, Math.round(startW + dx));
      const newH = Math.max(140, Math.round(startH + dy));
      updateNodeData(id, { width: newW, height: newH });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSaveLabel = () => {
    if (labelInput.trim()) {
      updateNodeData(id, { label: labelInput.trim() });
    }
    setIsEditingLabel(false);
  };

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderColor: `${color}60`,
        backgroundColor: isBackground ? `${color}06` : `${color}14`,
      }}
      className={`relative rounded-2xl border-2 border-dashed transition-colors select-none ${
        selected ? 'ring-2 ring-cyan-400 !border-solid' : ''
      } ${!isBackground ? 'zone-foreground' : ''}`}
    >
      {/* Resizer nativo de React Flow cuando el nodo está seleccionado */}
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={140}
        lineClassName="!border-cyan-400 !border-2"
        handleClassName="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-950 !rounded-md"
        onResize={(_, { width: w, height: h }) => {
          updateNodeData(id, { width: Math.round(w), height: Math.round(h) });
        }}
      />

      {/* Barra de Controles y Título en la Cabecera */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto z-20">
        {/* Título / Etiqueta del Área */}
        <div className="flex items-center gap-1.5">
          {isEditingLabel ? (
            <div className="flex items-center gap-1 bg-slate-950 border border-cyan-400 rounded-lg p-1">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') setIsEditingLabel(false);
                }}
                autoFocus
                className="px-2 py-0.5 text-xs bg-transparent text-slate-100 font-bold focus:outline-none w-48"
              />
              <button
                onClick={handleSaveLabel}
                className="p-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: `${color}18`,
                borderColor: `${color}50`,
                color: color,
              }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-extrabold tracking-wider uppercase backdrop-blur-sm group"
            >
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[180px]">{zoneData.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLabelInput(zoneData.label);
                  setIsEditingLabel(true);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity ml-1"
                title="Renombrar Área"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Acciones de Capa (Fondo / Frente), Color y Borrar */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 rounded-lg p-1 backdrop-blur-md">
          {/* Selector de Capa: Fondo (debajo de cables) vs Frente (sobre cables) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleZoneLayer(id);
            }}
            title={
              isBackground
                ? 'Capa: DEBAJO DE CABLES Y EQUIPOS (Fondo). Clic para traer al frente.'
                : 'Capa: ENCIMA DE CABLES (Frente). Clic para enviar al fondo.'
            }
            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              isBackground
                ? 'bg-slate-900 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-950/50'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{isBackground ? '⬇️ Fondo' : '⬆️ Frente'}</span>
          </button>

          {/* Selector rápido de color */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              title="Cambiar Color de Zona"
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" style={{ color }} />
            </button>
            {showColorPicker && (
              <div className="absolute right-0 top-full mt-1 p-1.5 bg-slate-900 border border-slate-700 rounded-lg shadow-xl flex gap-1 z-50">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNodeData(id, { color: c });
                      setShowColorPicker(false);
                    }}
                    style={{ backgroundColor: c }}
                    className="w-4 h-4 rounded-full border border-slate-950 hover:scale-125 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Botón eliminar área */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(id);
            }}
            title="Eliminar Área"
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Indicador de dimensiones en la esquina inferior izquierda */}
      <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400 opacity-60 select-none pointer-events-none">
        {width} × {height} px
      </div>

      {/* Tirador táctil en la esquina inferior derecha para redimensionar libremente */}
      <div
        onMouseDown={handleCornerMouseDown}
        title="Arrastra para redimensionar el área libremente"
        className="absolute bottom-1 right-1 p-1.5 rounded cursor-se-resize text-cyan-400/70 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all pointer-events-auto z-20 group"
      >
        <svg
          className="w-4 h-4 transform transition-transform group-hover:scale-125"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M21 15v6h-6M21 9v2M21 3v2M15 21h-2M9 21H7" strokeLinecap="round" />
          <line x1="21" y1="21" x2="11" y2="11" />
        </svg>
      </div>
    </div>
  );
});

ZoneNode.displayName = 'ZoneNode';
