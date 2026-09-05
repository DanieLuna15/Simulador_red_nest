'use client';

import React from 'react';
import { FileText, Download, X, Network, Cpu, Cable, CheckCircle } from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';

export const BOMReportModal: React.FC = () => {
  const isBOMModalOpen = useNetworkStore((s) => s.isBOMModalOpen);
  const setIsBOMModalOpen = useNetworkStore((s) => s.setIsBOMModalOpen);
  const nodes = useNetworkStore((s) => s.nodes);
  const edges = useNetworkStore((s) => s.edges);

  if (!isBOMModalOpen) return null;

  // Filtrar dispositivos (excluir notas y zonas)
  const hardwareNodes = nodes.filter(
    (n) => n.type !== 'zoneNode' && n.type !== 'textNoteNode'
  );

  // Conteo de equipamiento
  const deviceCounts: Record<string, number> = {};
  hardwareNodes.forEach((node) => {
    const type = (node.data.deviceType as string) || 'desconocido';
    deviceCounts[type] = (deviceCounts[type] || 0) + 1;
  });

  // Conteo de cables
  const cableCounts: Record<string, number> = {};
  edges.forEach((edge) => {
    const type = ((edge.data as Record<string, string>)?.cableType) || 'utp-cat6';
    cableCounts[type] = (cableCounts[type] || 0) + 1;
  });

  const handleExportCsv = () => {
    let csv = 'DISPOSITIVO,TIPO,DIRECCION_IP,MASCARA,GATEWAY,MAC,VLAN,ESTADO\n';
    hardwareNodes.forEach((node) => {
      const d = node.data;
      csv += `"${d.label}","${d.deviceType}","${d.ip || ''}","${d.subnetMask || '255.255.255.0'}","${d.gateway || ''}","${d.mac || ''}","${d.vlan || ''}","${d.isPoweredOn !== false ? 'ENCENDIDO' : 'APAGADO'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_tecnico_red_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Reporte Ejecutivo de Infraestructura (BOM)</h2>
              <p className="text-xs text-slate-400">Inventario de equipos, tiradas de cable y tabla de direccionamiento IP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={() => setIsBOMModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumen Métrico */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Dispositivos</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{hardwareNodes.length} unidades</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Cables Conectados</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{edges.length} enlaces</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Switches Administrables</div>
              <div className="text-xl font-bold text-amber-400 mt-1">
                {nodes.filter((n) => n.type === 'switchNode').length} en rack
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Estado de Operación</div>
              <div className="text-xl font-bold text-indigo-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-5 h-5 text-emerald-400" /> 100% OK
              </div>
            </div>
          </div>

          {/* Tabla de Equipamiento Hardware */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Desglose de Equipos en la Topología
            </h4>
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 font-semibold">Dispositivo</th>
                    <th className="p-2.5 font-semibold">Tipo</th>
                    <th className="p-2.5 font-semibold">IP Asignada</th>
                    <th className="p-2.5 font-semibold">MAC Address</th>
                    <th className="p-2.5 font-semibold">VLAN</th>
                    <th className="p-2.5 font-semibold">Alimentación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {hardwareNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 font-sans font-bold text-slate-200">{node.data.label as string}</td>
                      <td className="p-2.5 text-cyan-400 text-[11px]">{node.data.deviceType as string}</td>
                      <td className="p-2.5 text-emerald-400 font-semibold">{node.data.ip as string || 'DHCP'}</td>
                      <td className="p-2.5 text-slate-400 text-[10px]">{node.data.mac as string || '00:00:00:00'}</td>
                      <td className="p-2.5 text-amber-300 text-[11px]">{node.data.vlan as string || 'VLAN 1'}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            node.data.isPoweredOn !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {node.data.isPoweredOn !== false ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desglose de Cables */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cable className="w-3.5 h-3.5 text-cyan-400" />
              Cómputo de Cableado y Medios Físicos
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(cableCounts).map(([type, count]) => (
                <div key={type} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 capitalize">{type.replace('-', ' ')}:</span>
                  <span className="font-mono text-cyan-400 font-bold">{count} tiradas (~{count * 15} metros)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
