'use client';

import React, { useRef } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Play,
  Trash2,
  Layers,
  Sparkles,
  EyeOff,
} from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';

interface HeaderBarProps {
  onOpenPingModal: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenPingModal }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeScenarioId = useNetworkStore((s) => s.activeScenarioId);
  const loadScenario = useNetworkStore((s) => s.loadScenario);
  const isolatedDeviceId = useNetworkStore((s) => s.isolatedDeviceId);
  const setIsolatedDeviceId = useNetworkStore((s) => s.setIsolatedDeviceId);
  const nodes = useNetworkStore((s) => s.nodes);
  const clearCanvas = useNetworkStore((s) => s.clearCanvas);
  const exportScenarioJson = useNetworkStore((s) => s.exportScenarioJson);
  const importScenarioJson = useNetworkStore((s) => s.importScenarioJson);

  // Zundo temporal actions
  const handleUndo = () => {
    useNetworkStore.temporal.getState().undo();
  };

  const handleRedo = () => {
    useNetworkStore.temporal.getState().redo();
  };

  const handleExport = () => {
    const json = exportScenarioJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `escenario_red_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        importScenarioJson(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isolatedNode = isolatedDeviceId ? nodes.find((n) => n.id === isolatedDeviceId) : null;

  return (
    <header className="h-16 px-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-20 backdrop-blur-md">
      {/* Brand Logo & Título */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-black text-base">
            PT
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100 tracking-wide">
              PacketFlow <span className="text-cyan-400">SaaS</span>
            </span>
            <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              Next.js + Flow
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Simulador de Red Corporativa • 27 Puestos</div>
        </div>
      </div>

      {/* Selector de Escenarios Rápidos */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
        <Layers className="w-4 h-4 text-slate-400 ml-2 mr-1" />
        <button
          onClick={() => loadScenario('opcion1')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeScenarioId === 'opcion1'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Opción 1 (Switch 48P)
        </button>
        <button
          onClick={() => loadScenario('opcion2')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeScenarioId === 'opcion2'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Opción 2 (2x 24P)
        </button>
        <button
          onClick={() => loadScenario('opcion3')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeScenarioId === 'opcion3'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          Opción 3 (24P + 16P)
        </button>
      </div>

      {/* Banner de Aislamiento Activo si existe */}
      {isolatedNode && (
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs animate-pulse">
          <span>Aislamiento: <strong>{isolatedNode.data.label as string}</strong></span>
          <button
            onClick={() => setIsolatedDeviceId(null)}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-200"
            title="Quitar aislamiento y ver todos los cables"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Acciones: Undo, Redo, Simulación Ping, Guardar, Cargar */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={handleUndo}
            title="Deshacer (Ctrl+Z)"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            title="Rehacer (Ctrl+Y)"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Simular Ping */}
        <button
          onClick={onOpenPingModal}
          className="px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simular Ping</span>
        </button>

        {/* Exportar JSON */}
        <button
          onClick={handleExport}
          title="Guardar Escenario (.json)"
          className="p-2 text-slate-300 hover:text-cyan-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Cargar JSON */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Cargar Escenario (.json)"
          className="p-2 text-slate-300 hover:text-cyan-400 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Limpiar Lienzo */}
        <button
          onClick={() => {
            if (confirm('¿Deseas vaciar todo el lienzo para empezar en blanco?')) {
              clearCanvas();
            }
          }}
          title="Lienzo en blanco"
          className="p-2 text-rose-400 hover:text-rose-300 bg-slate-900 border border-slate-800 hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
