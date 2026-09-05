'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Send,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Radio,
  Target,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNetworkStore } from '@/store/useNetworkStore';

interface PingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PingModal: React.FC<PingModalProps> = ({ isOpen, onClose }) => {
  const nodes = useNetworkStore((s) => s.nodes);
  const runPingSimulation = useNetworkStore((s) => s.runPingSimulation);
  const runBroadcastPingFromRouter = useNetworkStore((s) => s.runBroadcastPingFromRouter);
  const isSimulatingPing = useNetworkStore((s) => s.isSimulatingPing);
  const pingLogs = useNetworkStore((s) => s.pingLogs);
  const activePingBanner = useNetworkStore((s) => s.activePingBanner);

  // Filtrar solo dispositivos conectables (excluir zonas y notas)
  const connectableNodes = nodes.filter(
    (n) => n.type !== 'zoneNode' && n.type !== 'textNoteNode'
  );

  const [pingMode, setPingMode] = useState<'unicast' | 'broadcast'>('unicast');
  const [sourceId, setSourceId] = useState<string>(connectableNodes[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(connectableNodes[1]?.id || '');
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunPing = async () => {
    setLastResult(null);
    // Auto-minimizar para permitir ver el viaje completo del sobre en el lienzo
    setIsMinimized(true);

    if (pingMode === 'unicast') {
      if (!sourceId || !targetId) return;
      const success = await runPingSimulation(sourceId, targetId);
      setLastResult(success);
      if (success) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } else {
      const count = await runBroadcastPingFromRouter();
      setLastResult(count > 0);
      if (count > 0) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Vista compacta flotante (Picture-in-Picture) mientras se observa el canvas
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 w-96 bg-slate-900/95 border-2 border-cyan-400/80 rounded-2xl shadow-2xl backdrop-blur-xl p-4 animate-in slide-in-from-bottom-5 duration-200 select-none">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSimulatingPing ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-xs font-bold text-slate-100">
              {isSimulatingPing ? 'Simulación en Curso...' : 'Simulación Lista'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Expandir Consola"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs font-mono text-cyan-300 mb-2 truncate">
          {activePingBanner || (lastResult === true ? '✅ Paquetes entregados con éxito' : 'Observando topología en el canvas')}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ver Consola Completa</span>
          </button>
          <button
            onClick={handleRunPing}
            disabled={isSimulatingPing}
            className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition-all flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Repetir</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Simulador de Conectividad & Ping Visual</h2>
              <p className="text-xs text-slate-400">Mira cómo los sobres ✉️ viajan físicamente por los cables</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimizar para ver el lienzo completo"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selector de Modo: Unicast o Broadcast */}
        <div className="px-5 pt-4 pb-2 bg-slate-900 flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setPingMode('unicast')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              pingMode === 'unicast'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Máquina a Máquina (Unicast)</span>
          </button>
          <button
            onClick={() => setPingMode('broadcast')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              pingMode === 'broadcast'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Router a TODAS las Máquinas (Sweep)</span>
          </button>
        </div>

        {/* Formulario */}
        <div className="p-5 space-y-4 border-b border-slate-800/80 bg-slate-900/50">
          {pingMode === 'unicast' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Origen (Transmisor):
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {connectableNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.data.label as string} ({(n.data.ip as string) || 'Sin IP'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destino (Receptor):
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  {connectableNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.data.label as string} ({(n.data.ip as string) || 'Sin IP'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              📡 <strong>Barrido Masivo desde el Gateway:</strong> El Router transmitirá paquetes ARP / ICMP que viajarán suavemente y de manera simultánea por todos los enlaces hacia cada PC, laptop, teléfono y servidor de la topología.
            </div>
          )}

          {/* Banner de estado activo */}
          {activePingBanner && (
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono text-center animate-pulse">
              {activePingBanner}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleRunPing}
              disabled={isSimulatingPing || (pingMode === 'unicast' && sourceId === targetId)}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSimulatingPing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Paquetes ✉️ viajando por los cables...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{pingMode === 'unicast' ? 'Iniciar Ping Visual (Ver en Canvas)' : 'Ejecutar Barrido Masivo'}</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimizar para despejar el canvas"
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Minimizar</span>
            </button>
          </div>
        </div>

        {/* Consola Terminal */}
        <div className="p-4 bg-slate-950 flex-1 min-h-[170px] max-h-[200px] overflow-y-auto font-mono text-xs text-emerald-400/90 leading-relaxed border-t border-slate-800/80">
          <div className="text-slate-500 mb-2">// Cisco IOS ICMP Terminal Output</div>
          {pingLogs.length === 0 ? (
            <div className="text-slate-600 italic">Selecciona el modo y presiona el botón para iniciar la transmisión visual...</div>
          ) : (
            pingLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-slate-600 select-none">&gt;</span>
                <span
                  className={
                    log.includes('✅')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('❌') || log.includes('agotado') || log.includes('ERROR')
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
              <CheckCircle className="w-4 h-4" /> 100% Verificado con Éxito
            </span>
          )}
          {lastResult === false && (
            <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4" /> Paquetes Perdidos
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
