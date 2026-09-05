'use client';

import React, { memo, useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { Type, Trash2, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { TextNoteNodeData } from '@/types/network';

const PRESET_COLORS = [
  '#00f0ff', // Cyan
  '#22c55e', // Green
  '#facc15', // Yellow
  '#f97316', // Orange
  '#ef4444', // Red
  '#d946ef', // Magenta
  '#f8fafc', // Light slate
];

export const TextNoteNode = memo(({ id, data, selected }: NodeProps) => {
  const noteData = data as unknown as TextNoteNodeData;
  const updateNodeData = useNetworkStore((s) => s.updateNodeData);
  const removeNode = useNetworkStore((s) => s.removeNode);

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(noteData.label || 'Nueva nota');

  const currentColor = noteData.color || '#00f0ff';
  const currentSize = noteData.fontSize || 13;
  const badgeStyle = noteData.badgeStyle || 'badge';

  const handleSaveText = () => {
    setIsEditing(false);
    updateNodeData(id, { label: text });
  };

  const changeColor = (color: string) => {
    updateNodeData(id, { color });
  };

  const changeSize = (delta: number) => {
    const newSize = Math.max(10, Math.min(26, currentSize + delta));
    updateNodeData(id, { fontSize: newSize });
  };

  const toggleStyle = () => {
    const styles: Array<'normal' | 'badge' | 'glow' | 'pill'> = ['normal', 'badge', 'glow', 'pill'];
    const next = styles[(styles.indexOf(badgeStyle) + 1) % styles.length];
    updateNodeData(id, { badgeStyle: next });
  };

  // Determinar clases según badgeStyle
  const getContainerStyle = () => {
    if (badgeStyle === 'pill') {
      return 'rounded-full px-5 py-2';
    }
    if (badgeStyle === 'glow') {
      return 'rounded-xl p-3.5 shadow-lg shadow-[var(--note-color)]/20 ring-1 ring-[var(--note-color)]/40';
    }
    if (badgeStyle === 'badge') {
      return 'rounded-lg p-3 border-l-4 border-l-[var(--note-color)]';
    }
    return 'rounded-lg p-3';
  };

  return (
    <div
      style={{ '--note-color': currentColor } as React.CSSProperties}
      className={`relative min-w-[200px] max-w-[320px] transition-all duration-200 bg-slate-900/95 border border-slate-700/80 backdrop-blur-md text-slate-100 ${getContainerStyle()} ${
        selected ? 'ring-2 ring-cyan-400' : ''
      }`}
    >
      {/* Barra de herramientas flotante al estar seleccionado */}
      {selected && (
        <div className="absolute -top-10 left-0 right-0 flex items-center justify-between p-1 rounded-lg bg-slate-950 border border-slate-700 shadow-xl z-10 gap-1">
          {/* Paleta de colores rápida */}
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={(e) => {
                  e.stopPropagation();
                  changeColor(c);
                }}
                className={`w-4 h-4 rounded-full border transition-transform hover:scale-125 ${
                  c === currentColor ? 'scale-125 border-white ring-2 ring-white/30' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-1">
            <button
              onClick={() => changeSize(-1)}
              title="Reducir fuente"
              className="p-1 rounded hover:bg-slate-800 text-slate-300 text-[10px]"
            >
              A-
            </button>
            <button
              onClick={() => changeSize(1)}
              title="Aumentar fuente"
              className="p-1 rounded hover:bg-slate-800 text-slate-300 text-[10px]"
            >
              A+
            </button>
            <button
              onClick={toggleStyle}
              title={`Modo actual: ${badgeStyle}. Clic para cambiar`}
              className="p-1 rounded hover:bg-slate-800 text-cyan-400 text-[10px] flex items-center"
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <button
              onClick={() => removeNode(id)}
              title="Eliminar nota"
              className="p-1 rounded hover:bg-rose-950/60 text-rose-400 text-[10px]"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido de la nota */}
      {isEditing ? (
        <textarea
          autoFocus
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSaveText}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSaveText();
            }
          }}
          className="w-full bg-slate-950/90 text-slate-100 rounded p-1.5 border border-cyan-400 focus:outline-none resize-none font-sans"
          style={{ fontSize: `${currentSize}px`, color: currentColor }}
        />
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          className="cursor-text whitespace-pre-wrap select-text leading-snug font-sans"
          style={{ fontSize: `${currentSize}px`, color: currentColor }}
          title="Doble clic para editar el texto"
        >
          {noteData.label || 'Escribe tu nota aquí...'}
        </div>
      )}
    </div>
  );
});

TextNoteNode.displayName = 'TextNoteNode';
