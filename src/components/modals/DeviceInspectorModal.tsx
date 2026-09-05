'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Power,
  SlidersHorizontal,
  Terminal,
  Server,
  Globe,
  Radio,
  Cpu,
  Save,
  CheckCircle,
  Network,
  RotateCcw,
} from 'lucide-react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { BaseDeviceData, ServerNodeData } from '@/types/network';

export const DeviceInspectorModal: React.FC = () => {
  const inspectorNodeId = useNetworkStore((s) => s.inspectorNodeId);
  const closeDeviceInspector = useNetworkStore((s) => s.closeDeviceInspector);
  const nodes = useNetworkStore((s) => s.nodes);
  const edges = useNetworkStore((s) => s.edges);
  const updateNodeData = useNetworkStore((s) => s.updateNodeData);
  const toggleDevicePower = useNetworkStore((s) => s.toggleDevicePower);
  const setIsWebBrowserOpen = useNetworkStore((s) => s.setIsWebBrowserOpen);

  const activeNode = nodes.find((n) => n.id === inspectorNodeId);
  const nodeData = (activeNode?.data || {}) as unknown as BaseDeviceData & ServerNodeData;

  const [activeTab, setActiveTab] = useState<'physical' | 'config' | 'cli' | 'services'>('config');

  // Form State
  const [label, setLabel] = useState('');
  const [ip, setIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('');
  const [gateway, setGateway] = useState('');
  const [dnsServer, setDnsServer] = useState('');
  const [vlan, setVlan] = useState('');
  const [dhcpEnabled, setDhcpEnabled] = useState(false);
  const [webContent, setWebContent] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // CLI State
  const [cliLogs, setCliLogs] = useState<string[]>([]);
  const [cliInput, setCliInput] = useState('');
  const [cliPrompt, setCliPrompt] = useState('Prompt>');

  useEffect(() => {
    if (activeNode) {
      setLabel(nodeData.label || '');
      setIp(nodeData.ip || '');
      setSubnetMask(nodeData.subnetMask || '255.255.255.0');
      setGateway(nodeData.gateway || '192.168.1.1');
      setDnsServer(nodeData.dnsServer || '8.8.8.8');
      setVlan(nodeData.vlan || 'VLAN 1');
      setDhcpEnabled(nodeData.dhcpEnabled || false);
      setWebContent(
        nodeData.webContent ||
          '<!DOCTYPE html><html><body><h1>Servidor Web PacketFlow</h1><p>En línea.</p></body></html>'
      );

      const hostname = nodeData.label.toLowerCase().replace(/[^a-z0-9]/g, '');
      setCliPrompt(
        activeNode.type === 'switchNode'
          ? `Switch#`
          : activeNode.type === 'routerNode'
          ? `Router#`
          : `C:\\Users\\Admin>`
      );

      setCliLogs([
        `Cisco / Linux Network Emulation Shell v3.0 [PacketFlow SaaS]`,
        `Dispositivo: ${nodeData.label} [${nodeData.model || 'Generic Device'}]`,
        `Escribe "help" para ver la lista de comandos disponibles.`,
      ]);
    }
  }, [inspectorNodeId]);

  if (!inspectorNodeId || !activeNode) return null;

  const isPoweredOn = nodeData.isPoweredOn ?? true;
  const connectedEdges = edges.filter(
    (e) => e.source === inspectorNodeId || e.target === inspectorNodeId
  );

  const handleSaveConfig = () => {
    updateNodeData(inspectorNodeId, {
      label,
      ip,
      subnetMask,
      gateway,
      dnsServer,
      vlan,
      dhcpEnabled,
      webContent,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();
    const newLogs = [...cliLogs, `${cliPrompt} ${cmd}`];

    if (mainCmd === 'help') {
      newLogs.push(
        `Comandos disponibles:`,
        `  ipconfig [/all]          - Muestra la configuración de red TCP/IP`,
        `  ping <ip_address>        - Prueba la conectividad ICMP hacia un destino`,
        `  show ip int brief        - Muestra resumen de interfaces de red`,
        `  show vlan                - Muestra las VLANs configuradas`,
        `  enable                   - Entra al modo privilegiado EXEC`,
        `  conf t                   - Modo de configuración de terminal`,
        `  arp -a                   - Muestra la tabla de resolución ARP`,
        `  clear                    - Limpia la pantalla de la consola`
      );
    } else if (mainCmd === 'clear') {
      setCliLogs([]);
      setCliInput('');
      return;
    } else if (mainCmd === 'ipconfig') {
      newLogs.push(
        `Configuración IP de Windows / Linux:`,
        `   Adaptador Ethernet FastEthernet0:`,
        `      Sufijo DNS específico para la conexión: corp.local`,
        `      Dirección IPv4. . . . . . . . . . . . : ${ip || '0.0.0.0'}`,
        `      Máscara de subred . . . . . . . . . . : ${subnetMask}`,
        `      Puerta de enlace predeterminada . . . : ${gateway}`,
        `      Dirección física (MAC). . . . . . . . : ${nodeData.mac || '00:1A:2B:3C:4D:5E'}`
      );
    } else if (mainCmd === 'ping') {
      const targetIp = args[1];
      if (!targetIp) {
        newLogs.push(`Uso: ping <direccion_ip>`);
      } else {
        const found = nodes.find((n) => (n.data.ip as string) === targetIp);
        if (found) {
          newLogs.push(
            `Haciendo ping a ${targetIp} con 32 bytes de datos:`,
            `Respuesta desde ${targetIp}: bytes=32 tiempo=1.1ms TTL=64`,
            `Respuesta desde ${targetIp}: bytes=32 tiempo=0.9ms TTL=64`,
            `Respuesta desde ${targetIp}: bytes=32 tiempo=1.0ms TTL=64`,
            `Respuesta desde ${targetIp}: bytes=32 tiempo=0.8ms TTL=64`,
            `Estadísticas de ping para ${targetIp}:`,
            `    Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% de pérdida)`
          );
        } else {
          newLogs.push(
            `Haciendo ping a ${targetIp} con 32 bytes de datos:`,
            `Tiempo de espera agotado para esta solicitud.`,
            `Tiempo de espera agotado para esta solicitud.`,
            `Tiempo de espera agotado para esta solicitud.`,
            `Paquetes: enviados = 4, recibidos = 0, perdidos = 4 (100% de pérdida)`
          );
        }
      }
    } else if (mainCmd === 'show' && args[1] === 'ip' && args[2] === 'int') {
      newLogs.push(
        `Interface              IP-Address      OK? Method Status                Protocol`,
        `FastEthernet0/1        ${ip || 'unassigned'}  YES manual up                    up`,
        `GigabitEthernet0/1     ${gateway || 'unassigned'}  YES manual up                    up`,
        `Vlan1                  192.168.1.254   YES manual up                    up`
      );
    } else if (mainCmd === 'show' && args[1] === 'vlan') {
      newLogs.push(
        `VLAN Name                             Status    Ports`,
        `---- -------------------------------- --------- -------------------------------`,
        `1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4`,
        `10   VOZ_CALLCENTER                   active    Fa0/5, Fa0/6`,
        `20   DATOS_ADMIN                      active    Fa0/7, Fa0/8`
      );
    } else if (mainCmd === 'enable') {
      setCliPrompt(`${nodeData.label}#`);
      newLogs.push(`Password: (Acceso concedido al modo privilegiado)`);
    } else if (mainCmd === 'conf' && (args[1] === 't' || args[1] === 'terminal')) {
      setCliPrompt(`${nodeData.label}(config)#`);
      newLogs.push(`Ingrese comandos de configuración, uno por línea. Termine con CNTL/Z.`);
    } else {
      newLogs.push(`% Comando desconocido o incompleto: "${cmd}". Escribe "help".`);
    }

    setCliLogs(newLogs);
    setCliInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header con Power Switch */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{nodeData.label}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  {nodeData.model || nodeData.deviceType}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                MAC: {nodeData.mac || '52:54:00:12:34:56'} • IP: {ip || 'Sin Asignar'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Interruptor de Energía */}
            <button
              onClick={() => toggleDevicePower(inspectorNodeId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-md ${
                isPoweredOn
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isPoweredOn ? 'POWER ON' : 'POWER OFF'}</span>
            </button>

            <button
              onClick={closeDeviceInspector}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas estilo Cisco Packet Tracer */}
        <div className="flex items-center bg-slate-950/90 border-b border-slate-800 px-6 gap-2">
          <button
            onClick={() => setActiveTab('physical')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'physical'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>FÍSICO</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>CONFIG IP</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cli'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>CLI / TERMINAL</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'services'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>SERVICIOS & APPS</span>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[380px]">
          {/* TAB FÍSICO */}
          {activeTab === 'physical' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-200">Estado de Energía del Chasis</div>
                  <div className="text-xs text-slate-400">
                    Al apagar el equipo se cortan los paquetes y enlaces en tiempo real.
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full ${
                    isPoweredOn ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-500'
                  }`}
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Interfaces y Puertos Conectados ({connectedEdges.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {connectedEdges.map((edge, i) => (
                    <div
                      key={edge.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-mono text-slate-300">Port {i + 1} (Gigabit)</span>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">
                        {(edge.data as Record<string, string>)?.speed || '1 Gbps'}
                      </span>
                    </div>
                  ))}
                  {connectedEdges.length === 0 && (
                    <div className="col-span-2 p-6 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      No hay cables conectados a este equipo actualmente.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONFIG IP */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Dispositivo (Hostname):
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asignación de Dirección IP:
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        checked={dhcpEnabled}
                        onChange={() => setDhcpEnabled(true)}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span>DHCP</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        checked={!dhcpEnabled}
                        onChange={() => setDhcpEnabled(false)}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span>Estática</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dirección IPv4:
                  </label>
                  <input
                    type="text"
                    value={ip}
                    disabled={dhcpEnabled}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 disabled:opacity-50 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
                    placeholder="192.168.1.10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Máscara de Subred:
                  </label>
                  <input
                    type="text"
                    value={subnetMask}
                    disabled={dhcpEnabled}
                    onChange={(e) => setSubnetMask(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 disabled:opacity-50 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
                    placeholder="255.255.255.0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Puerta de Enlace (Default Gateway):
                  </label>
                  <input
                    type="text"
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
                    placeholder="192.168.1.1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Servidor DNS Primario:
                  </label>
                  <input
                    type="text"
                    value={dnsServer}
                    onChange={(e) => setDnsServer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
                    placeholder="8.8.8.8"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Configuración guardada en la memoria NVRAM.
                  </span>
                )}
                <button
                  onClick={handleSaveConfig}
                  className="ml-auto px-5 py-2 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Aplicar Cambios</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CLI TERMINAL */}
          {activeTab === 'cli' && (
            <div className="h-full flex flex-col bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-xs text-emerald-400">
              <div className="flex-1 overflow-y-auto space-y-1 mb-3 max-h-[250px]">
                {cliLogs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap leading-relaxed text-slate-300">
                    {log}
                  </div>
                ))}
              </div>

              <form onSubmit={handleCliSubmit} className="flex items-center gap-2 border-t border-slate-800 pt-2">
                <span className="text-cyan-400 font-bold select-none">{cliPrompt}</span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Escribe un comando (ej: ipconfig, ping, help)..."
                  className="flex-1 bg-transparent text-emerald-300 focus:outline-none font-mono text-xs"
                />
              </form>
            </div>
          )}

          {/* TAB SERVICIOS Y APPS */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {nodeData.deviceType === 'server-web' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-cyan-400">Servidor Web Apache / Nginx</h4>
                      <p className="text-xs text-slate-400">
                        Edita el código HTML que se servirá cuando las PCs accedan a esta IP.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsWebBrowserOpen(true, `http://${ip || '192.168.1.10'}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Ver en Navegador</span>
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={webContent}
                    onChange={(e) => setWebContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar Página Web
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Navegador Web (Cisco Web Browser)</h4>
                      <p className="text-xs text-slate-400">
                        Navega a los servidores HTTP de la intranet o Internet simulado.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsWebBrowserOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Abrir Navegador</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                    <div className="font-bold text-slate-300">Servicios Activos en este equipo:</div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Cliente DNS: 8.8.8.8</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Cliente DHCP: {dhcpEnabled ? 'Activo' : 'Desactivado (IP Estática)'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>Pila de Protocolos TCP/IP v4 lista</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
