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
  EyeOff,
  Calculator,
  FileText,
  Globe,
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

  const setIsSubnetCalcOpen = useNetworkStore((s) => s.setIsSubnetCalcOpen);
  const setIsBOMModalOpen = useNetworkStore((s) => s.setIsBOMModalOpen);
  const setIsWebBrowserOpen = useNetworkStore((s) => s.setIsWebBrowserOpen);

  const isLiveTrafficActive = useNetworkStore((s) => s.isLiveTrafficActive);
  const toggleLiveTraffic = useNetworkStore((s) => s.toggleLiveTraffic);
  const activeVlanFilter = useNetworkStore((s) => s.activeVlanFilter);
  const setActiveVlanFilter = useNetworkStore((s) => s.setActiveVlanFilter);

  const isEnvelopeMode = useNetworkStore((s) => s.isEnvelopeMode);
  const setEnvelopeMode = useNetworkStore((s) => s.setEnvelopeMode);

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
    a.download = `escenario_red_saas_${new Date().toISOString().slice(0, 10)}.json`;
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
    <header className="h-16 px-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-20 backdrop-blur-md select-none">
      {/* Brand Logo & Título */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-black text-base">
            PT
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100 tracking-wide">
              PacketFlow <span className="text-cyan-400">Cloud SaaS</span>
            </span>
            <span className="px-1.5 py-0.2 text-[9px] uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              v3.0 Pro
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Simulador de Red Corporativa • Cisco Packet Tracer Web</div>
        </div>
      </div>

      {/* Selector de Escenarios */}
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
          Opción 1 (48P Central)
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

      {/* Herramientas SaaS & Acciones */}
      <div className="flex items-center gap-2">
        {/* Tráfico en Vivo NOC */}
        <button
          onClick={toggleLiveTraffic}
          title={isLiveTrafficActive ? 'Desactivar simulación de tráfico continuo' : 'Activar animación de paquetes en vivo por los cables (NOC Mode)'}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isLiveTrafficActive
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveTrafficActive ? 'bg-slate-950 animate-ping' : 'bg-emerald-500'}`} />
          <span>{isLiveTrafficActive ? 'NOC LIVE' : 'Tráfico'}</span>
        </button>

        {/* Filtro de VLANs */}
        <select
          value={activeVlanFilter || ''}
          onChange={(e) => setActiveVlanFilter(e.target.value || null)}
          className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-cyan-300 font-mono focus:outline-none cursor-pointer"
          title="Filtrar dispositivos por VLAN"
        >
          <option value="">Todas las VLANs</option>
          <option value="VLAN 10">VLAN 10 (CallCenter / Datos)</option>
          <option value="VLAN 20">VLAN 20 (Telefonía Voz)</option>
          <option value="VLAN 30">VLAN 30 (Admin / Gerencia)</option>
          <option value="VLAN 50">VLAN 50 (Wi-Fi 6)</option>
          <option value="VLAN 99">VLAN 99 (Servidores)</option>
        </select>

        {/* Calculadora Subredes VLSM */}
        <button
          onClick={() => setIsSubnetCalcOpen(true)}
          title="Calculadora de Subredes IPv4 / VLSM"
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>VLSM</span>
        </button>

        {/* Reporte BOM */}
        <button
          onClick={() => setIsBOMModalOpen(true)}
          title="Inventario y Reporte de Equipamiento (BOM)"
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Reporte BOM</span>
        </button>

        {/* Navegador Web */}
        <button
          onClick={() => setIsWebBrowserOpen(true)}
          title="Abrir Navegador Web simulado"
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Browser</span>
        </button>

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

        {/* Modo Sobre PDU Interactivo */}
        <button
          onClick={() => setEnvelopeMode(!isEnvelopeMode)}
          title={isEnvelopeMode ? 'Cancelar Modo Sobre' : 'Modo Sobre PDU: Haz clic en el equipo origen y luego en el destino para ver el sobre volar por los cables'}
          className={`px-3 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-md ${
            isEnvelopeMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/30 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-amber-300 hover:text-amber-200 hover:bg-slate-800'
          }`}
        >
          <span>✉️</span>
          <span>{isEnvelopeMode ? 'Haz Clic...' : 'Modo Sobre'}</span>
        </button>

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
