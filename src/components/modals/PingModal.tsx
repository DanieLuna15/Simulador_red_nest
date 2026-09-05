'use client';

import React, { useState } from 'react';
import { Terminal, Send, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNetworkStore } from '@/store/useNetworkStore';

interface PingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PingModal: React.FC<PingModalProps> = ({ isOpen, onClose }) => {
  const nodes = useNetworkStore((s) => s.nodes);
  const runPingSimulation = useNetworkStore((s) => s.runPingSimulation);
  const isSimulatingPing = useNetworkStore((s) => s.isSimulatingPing);
  const pingLogs = useNetworkStore((s) => s.pingLogs);

  // Filtrar solo dispositivos conectables (excluir zonas y notas)
  const connectableNodes = nodes.filter(
    (n) => n.type !== 'zoneNode' && n.type !== 'textNoteNode'
  );

  const [sourceId, setSourceId] = useState<string>(connectableNodes[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(connectableNodes[1]?.id || '');
  const [lastResult, setLastResult] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleRunPing = async () => {
    if (!sourceId || !targetId) return;
    setLastResult(null);
    const success = await runPingSimulation(sourceId, targetId);
    setLastResult(success);
    if (success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Simulador de Ping (ICMP Echo)</h2>
              <p className="text-xs text-slate-400">Comprueba la conectividad de extremo a extremo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Origen / Destino */}
        <div className="p-5 space-y-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Equipo Origen (Transmisor):
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                {connectableNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.label as string} ({n.data.ip as string || 'Sin IP'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Equipo Destino (Receptor):
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
              >
                {connectableNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.label as string} ({n.data.ip as string || 'Sin IP'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunPing}
            disabled={isSimulatingPing || sourceId === targetId}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSimulatingPing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando paquetes ICMP...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ejecutar Ping</span>
              </>
            )}
          </button>
        </div>

        {/* Consola Terminal */}
        <div className="p-4 bg-slate-950 flex-1 min-h-[180px] max-h-[220px] overflow-y-auto font-mono text-xs text-emerald-400/90 leading-relaxed border-t border-slate-800/80">
          <div className="text-slate-500 mb-2">// Cisco IOS / Linux Terminal Output</div>
          {pingLogs.length === 0 ? (
            <div className="text-slate-600 italic">Selecciona los equipos y presiona "Ejecutar Ping"...</div>
          ) : (
            pingLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-slate-600 select-none">&gt;</span>
                <span
                  className={
                    log.includes('✅')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('❌') || log.includes('agotado')
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-300'
                  }
                >
                  {log}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-between text-xs">
          {lastResult === true && (
            <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle className="w-4 h-4" /> Conectividad 100% Verificada
            </span>
          )}
          {lastResult === false && (
            <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4" /> Red no conectada
            </span>
          )}
          {lastResult === null && <span className="text-slate-500">Listo para simular</span>}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
