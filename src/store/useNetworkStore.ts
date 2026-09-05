import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import { defaultScenarios } from '../data/templates';
import { DeviceType, CableType } from '../types/network';

export interface ActivePacketInfo {
  direction: 'forward' | 'reverse';
  color: string;
  label?: string;
  duration?: number;
}

interface NetworkState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isolatedDeviceId: string | null;
  activeScenarioId: string;
  isSimulatingPing: boolean;
  pingLogs: string[];
  alertMessage: string | null;

  // Visual Packet Simulation States
  animatingPackets: Record<string, ActivePacketInfo>;
  isEnvelopeMode: boolean;
  envelopeSourceId: string | null;
  activePingBanner: string | null;

  // SaaS Tools States
  activeCableType: CableType;
  inspectorNodeId: string | null;
  isBOMModalOpen: boolean;
  isSubnetCalcOpen: boolean;
  isWebBrowserOpen: boolean;
  webBrowserUrl: string;
  isLiveTrafficActive: boolean;
  activeVlanFilter: string | null;

  // React Flow Handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => boolean;

  // Tool Actions
  setActiveCableType: (type: CableType) => void;
  openDeviceInspector: (id: string) => void;
  closeDeviceInspector: () => void;
  setIsBOMModalOpen: (open: boolean) => void;
  setIsSubnetCalcOpen: (open: boolean) => void;
  setIsWebBrowserOpen: (open: boolean, initialUrl?: string) => void;
  setWebBrowserUrl: (url: string) => void;
  toggleLiveTraffic: () => void;
  setActiveVlanFilter: (vlan: string | null) => void;
  setEnvelopeMode: (enabled: boolean) => void;
  handleNodeClickEnvelope: (nodeId: string) => void;
  runVisualPingPath: (sourceId: string, targetId: string) => Promise<boolean>;
  runBroadcastPingFromRouter: () => Promise<number>;

  // Device & Topology Actions
  setSelectedNodeId: (id: string | null) => void;
  setIsolatedDeviceId: (id: string | null) => void;
  toggleDevicePower: (id: string) => void;
  addDevice: (type: DeviceType, position?: { x: number; y: number }) => void;
  addTextNote: (label?: string, color?: string, position?: { x: number; y: number }) => void;
  addZone: (label?: string, color?: string, position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  toggleZoneLayer: (id: string) => void;
  removeNode: (id: string) => void;
  clearCanvas: () => void;
  loadScenario: (scenarioId: string) => void;
  exportScenarioJson: () => string;
  importScenarioJson: (jsonStr: string) => boolean;
  dismissAlert: () => void;
  runPingSimulation: (sourceId: string, targetId: string) => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>()(
  temporal(
    (set, get) => ({
      nodes: defaultScenarios.opcion1.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isPoweredOn: true,
          dhcpEnabled: false,
          subnetMask: '255.255.255.0',
          gateway: '192.168.1.1',
          dnsServer: '8.8.8.8',
        },
      })),
      edges: defaultScenarios.opcion1.edges,
      selectedNodeId: null,
      isolatedDeviceId: null,
      activeScenarioId: 'opcion1',
      isSimulatingPing: false,
      pingLogs: [],
      alertMessage: null,

      activeCableType: 'auto',
      inspectorNodeId: null,
      isBOMModalOpen: false,
      isSubnetCalcOpen: false,
      isWebBrowserOpen: false,
      webBrowserUrl: 'http://192.168.1.10',
      isLiveTrafficActive: false,
      activeVlanFilter: null,
      animatingPackets: {},
      isEnvelopeMode: false,
      envelopeSourceId: null,
      activePingBanner: null,

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        const { nodes, edges, activeCableType } = get();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) return false;

        // Validar si algún equipo está apagado
        if (sourceNode.data.isPoweredOn === false) {
          set({
            alertMessage: `⚠️ ¡Equipo Apagado! "${sourceNode.data.label}" está sin energía eléctrica. Enciéndelo en su panel físico para habilitar enlaces.`,
          });
          return false;
        }
        if (targetNode.data.isPoweredOn === false) {
          set({
            alertMessage: `⚠️ ¡Equipo Apagado! "${targetNode.data.label}" está sin energía eléctrica. Enciéndelo en su panel físico para habilitar enlaces.`,
          });
          return false;
        }

        // Validar límite de puertos en Switches & Hubs
        const checkPortLimit = (node: Node) => {
          if (node.type === 'switchNode') {
            const maxPorts = (node.data.maxPorts as number) || 24;
            const currentConnected = edges.filter(
              (e) => e.source === node.id || e.target === node.id
            ).length;

            if (currentConnected >= maxPorts) {
              set({
                alertMessage: `⚠️ ¡LÍMITE ALCANZADO! El switch "${node.data.label}" tiene ocupados sus ${maxPorts} puertos físicos. No se pueden conectar más equipos.`,
              });
              return false;
            }
          }
          return true;
        };

        if (!checkPortLimit(sourceNode) || !checkPortLimit(targetNode)) {
          return false;
        }

        // Determinar tipo de cable (si es auto, deducir según los dispositivos)
        let cableTypeToUse = activeCableType;
        if (cableTypeToUse === 'auto') {
          const sType = (sourceNode.data.deviceType as string) || '';
          const tType = (targetNode.data.deviceType as string) || '';

          if (sType === 'ap' || tType === 'ap' || sType === 'smartphone' || tType === 'smartphone') {
            cableTypeToUse = 'wireless';
          } else if (
            (sType.startsWith('router') || sType === 'firewall') &&
            (tType.startsWith('router') || tType === 'firewall')
          ) {
            cableTypeToUse = 'serial-wan';
          } else if (
            (sType.startsWith('switch') && tType.startsWith('switch')) ||
            (sType === 'pc' && tType === 'pc')
          ) {
            cableTypeToUse = 'utp-crossover';
          } else if (
            (sType.startsWith('switch') && (tType.startsWith('router') || tType === 'cloud')) ||
            (tType.startsWith('switch') && (sType.startsWith('router') || sType === 'cloud'))
          ) {
            cableTypeToUse = 'fiber-sfp';
          } else {
            cableTypeToUse = 'utp-cat6';
          }
        }

        const speedsMap: Record<CableType, string> = {
          'utp-cat6': '1 Gbps Cat6',
          'utp-crossover': '1 Gbps Crossover',
          'fiber-sfp': '10 Gbps SFP+',
          wireless: '1.2 Gbps Wi-Fi 6',
          'serial-wan': '2.048 Mbps Serial WAN',
          auto: '1 Gbps Auto',
        };

        const newEdge: Edge = {
          id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: 'networkCableEdge',
          data: {
            cableType: cableTypeToUse,
            speed: speedsMap[cableTypeToUse] || '1 Gbps',
            status: 'active',
            animated: cableTypeToUse === 'fiber-sfp' || cableTypeToUse === 'wireless',
          },
        };

        set({
          edges: addEdge(newEdge, edges),
          alertMessage: null,
        });
        return true;
      },

      setActiveCableType: (type) => set({ activeCableType: type }),

      openDeviceInspector: (id) => set({ inspectorNodeId: id }),
      closeDeviceInspector: () => set({ inspectorNodeId: null }),

      setIsBOMModalOpen: (open) => set({ isBOMModalOpen: open }),
      setIsSubnetCalcOpen: (open) => set({ isSubnetCalcOpen: open }),
      setIsWebBrowserOpen: (open, initialUrl) =>
        set({
          isWebBrowserOpen: open,
          webBrowserUrl: initialUrl || get().webBrowserUrl,
        }),
      setWebBrowserUrl: (url) => set({ webBrowserUrl: url }),

      toggleLiveTraffic: () => set({ isLiveTrafficActive: !get().isLiveTrafficActive }),
      setActiveVlanFilter: (vlan) =>
        set({ activeVlanFilter: get().activeVlanFilter === vlan ? null : vlan }),

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      setIsolatedDeviceId: (id) => {
        set({ isolatedDeviceId: get().isolatedDeviceId === id ? null : id });
      },

      toggleDevicePower: (id) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === id) {
              const currentPower = node.data.isPoweredOn ?? true;
              return {
                ...node,
                data: {
                  ...node.data,
                  isPoweredOn: !currentPower,
                },
              };
            }
            return node;
          }),
        });
      },

      addDevice: (type, position) => {
        const pos = position || {
          x: 360 + Math.random() * 120,
          y: 260 + Math.random() * 120,
        };
        const id = `${type}-${Date.now()}`;
        const randomNum = Math.floor(10 + Math.random() * 89);
        const randomIpHost = Math.floor(20 + Math.random() * 200);

        let newNode: Node;

        // 1. SWITCHES Y HUBS
        if (type.startsWith('switch-') || type === 'hub-5') {
          const maxPorts =
            type === 'switch-48'
              ? 48
              : type === 'switch-24'
              ? 24
              : type === 'switch-16'
              ? 16
              : type === 'switch-8'
              ? 8
              : 5;

          const isHub = type === 'hub-5';
          newNode = {
            id,
            type: 'switchNode',
            position: pos,
            data: {
              label: isHub ? `HUB-5P-${randomNum}` : `SW-${maxPorts}P-${randomNum}`,
              deviceType: type,
              maxPorts,
              isPoweredOn: true,
              ip: isHub ? '' : `192.168.1.${Math.floor(2 + Math.random() * 20)}`,
              subnetMask: '255.255.255.0',
              vlan: 'VLAN 1 (Nativa)',
              model: isHub ? 'Ethernet Hub 5-Port' : `Cisco Catalyst / TP-Link ${maxPorts}P L2+`,
            },
          };
        }
        // 2. ROUTERS Y PERÍMETRO
        else if (type === 'router' || type === 'firewall' || type === 'ont' || type === 'cloud') {
          const names: Record<string, string> = {
            router: `Router-MikroTik-${randomNum}`,
            firewall: `FortiGate-60F-${randomNum}`,
            ont: `ONT-AXS-GPON-${randomNum}`,
            cloud: 'INTERNET-CLOUD-WAN',
          };
          const models: Record<string, string> = {
            router: 'MikroTik CCR2004-16G-2S+',
            firewall: 'Fortinet FortiGate 60F UTM Next-Gen',
            ont: 'Huawei EchoLife HG8245H GPON ONT',
            cloud: 'Global ISP WAN Uplink (Tier 1)',
          };

          newNode = {
            id,
            type: 'routerNode',
            position: pos,
            data: {
              label: names[type] || 'Router-GW',
              deviceType: type,
              isPoweredOn: true,
              ip: type === 'cloud' ? '200.87.100.1' : '192.168.1.1',
              subnetMask: '255.255.255.0',
              gateway: type === 'cloud' ? '0.0.0.0' : '200.87.100.1',
              dnsServer: '8.8.8.8',
              model: models[type],
              firewallRulesCount: type === 'firewall' ? 14 : undefined,
            },
          };
        }
        // 3. SERVIDORES
        else if (type.startsWith('server-')) {
          const srvNames: Record<string, string> = {
            'server-web': 'SRV-WEB-PORTAL',
            'server-dns': 'SRV-DNS-DHCP',
            'server-db': 'SRV-SQL-DATABASE',
            'server-nas': 'SRV-NAS-STORAGE',
          };
          newNode = {
            id,
            type: 'workstationNode',
            position: pos,
            data: {
              label: `${srvNames[type] || 'SRV'}-${randomNum}`,
              deviceType: type,
              isPoweredOn: true,
              ip: `192.168.1.${Math.floor(10 + Math.random() * 15)}`,
              subnetMask: '255.255.255.0',
              gateway: '192.168.1.1',
              dnsServer: '192.168.1.10',
              mac: `00:50:56:${randomNum}:00:${randomNum}`,
              vlan: 'VLAN 30 (Servers)',
              status: 'online',
              webContent:
                type === 'server-web'
                  ? `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0c1322;color:#f8fafc;padding:30px;text-align:center;"><h1 style="color:#00f0ff;">🚀 Portal Corporativo Intranet</h1><p>Servidor Web Apache/Nginx simulado en <strong>PacketFlow Cloud</strong>.</p><div style="margin-top:20px;padding:15px;background:#1e293b;border-radius:10px;display:inline-block;">Sistema de Planillas & Facturación Operativo ✅</div></body></html>`
                  : undefined,
              dhcpPool:
                type === 'server-dns'
                  ? {
                      startIp: '192.168.10.100',
                      endIp: '192.168.10.200',
                      subnetMask: '255.255.255.0',
                      gateway: '192.168.1.1',
                    }
                  : undefined,
              dnsRecords:
                type === 'server-dns'
                  ? {
                      'empresa.local': '192.168.1.10',
                      'intranet.corp': '192.168.1.10',
                      'portal.com': '192.168.1.10',
                    }
                  : undefined,
            },
          };
        }
        // 4. ANOTACIONES Y ZONAS
        else if (type === 'text-note') {
          newNode = {
            id,
            type: 'textNoteNode',
            position: pos,
            data: {
              label: 'Nota de red: escribe aquí...',
              color: '#00f0ff',
              fontSize: 13,
              badgeStyle: 'badge',
            },
          };
        } else if (type === 'zone') {
          newNode = {
            id,
            type: 'zoneNode',
            position: pos,
            zIndex: -1,
            style: { width: 400, height: 240 },
            data: {
              label: 'NUEVA ÁREA DE OFICINA',
              color: '#3b82f6',
              width: 400,
              height: 240,
              isBackground: true,
            },
            draggable: true,
            selectable: true,
          };
        }
        // 5. TERMINALES & ENDPOINTS
        else {
          const devLabels: Record<string, string> = {
            pc: 'PC-OFICINA',
            laptop: 'LAPTOP-WIFI',
            smartphone: 'SMARTPHONE',
            phone: 'VoIP-PHONE',
            printer: 'IMPRESORA-RED',
            camera: 'CAM-CCTV-HD',
            ap: 'AP-WIFI6',
            iot: 'SENSOR-IOT',
          };
          newNode = {
            id,
            type: 'workstationNode',
            position: pos,
            data: {
              label: `${devLabels[type] || 'DEVICE'}-${randomNum}`,
              deviceType: type,
              isPoweredOn: true,
              dhcpEnabled: true,
              ip: `192.168.10.${randomIpHost}`,
              subnetMask: '255.255.255.0',
              gateway: '192.168.1.1',
              dnsServer: '8.8.8.8',
              mac: `52:54:00:${randomNum}:${randomNum}:${randomNum}`,
              vlan: type === 'phone' ? 'VLAN 20 (Voz)' : 'VLAN 10 (Datos)',
              status: 'online',
            },
          };
        }

        set({ nodes: [...get().nodes, newNode] });
      },

      addTextNote: (label = 'Nueva nota de red', color = '#00f0ff', position) => {
        const id = `note-${Date.now()}`;
        const pos = position || { x: 300, y: 200 };
        const newNode: Node = {
          id,
          type: 'textNoteNode',
          position: pos,
          data: { label, color, fontSize: 13, badgeStyle: 'badge' },
        };
        set({ nodes: [...get().nodes, newNode] });
      },

      addZone: (label = 'Área Departamental', color = '#00f0ff', position) => {
        const id = `zone-${Date.now()}`;
        const pos = position || { x: 200, y: 200 };
        const newNode: Node = {
          id,
          type: 'zoneNode',
          position: pos,
          zIndex: -1,
          style: { width: 400, height: 260 },
          data: { label, color, width: 400, height: 260, isBackground: true },
          draggable: true,
          selectable: true,
        };
        set({ nodes: [newNode, ...get().nodes] });
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === id) {
              const nextData = { ...node.data, ...data };
              const nextStyle = { ...(node.style || {}) };
              if (typeof data.width === 'number' || typeof data.width === 'string') {
                nextStyle.width = data.width;
              }
              if (typeof data.height === 'number' || typeof data.height === 'string') {
                nextStyle.height = data.height;
              }
              let nextZIndex = node.zIndex;
              if (data.isBackground !== undefined) {
                nextZIndex = data.isBackground ? -1 : 30;
              }
              return {
                ...node,
                data: nextData,
                style: nextStyle,
                zIndex: nextZIndex,
              };
            }
            return node;
          }),
        });
      },

      toggleZoneLayer: (id) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === id) {
              const isBg = node.data.isBackground !== false;
              const nextBg = !isBg;
              return {
                ...node,
                zIndex: nextBg ? -1 : 30,
                data: { ...node.data, isBackground: nextBg },
              };
            }
            return node;
          }),
        });
      },

      removeNode: (id) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
          isolatedDeviceId: get().isolatedDeviceId === id ? null : get().isolatedDeviceId,
          inspectorNodeId: get().inspectorNodeId === id ? null : get().inspectorNodeId,
        });
      },

      clearCanvas: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          isolatedDeviceId: null,
          inspectorNodeId: null,
        });
      },

      loadScenario: (scenarioId) => {
        const scenario = defaultScenarios[scenarioId];
        if (scenario) {
          set({
            nodes: scenario.nodes.map((n) => ({
              ...n,
              data: {
                ...n.data,
                isPoweredOn: true,
                dhcpEnabled: false,
                subnetMask: '255.255.255.0',
                gateway: '192.168.1.1',
                dnsServer: '8.8.8.8',
              },
            })),
            edges: scenario.edges,
            activeScenarioId: scenarioId,
            selectedNodeId: null,
            isolatedDeviceId: null,
            inspectorNodeId: null,
            alertMessage: null,
          });
        }
      },

      exportScenarioJson: () => {
        const state = {
          version: '3.0.0-saas',
          timestamp: new Date().toISOString(),
          nodes: get().nodes,
          edges: get().edges,
        };
        return JSON.stringify(state, null, 2);
      },

      importScenarioJson: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr);
          if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
            set({
              nodes: data.nodes,
              edges: data.edges,
              selectedNodeId: null,
              isolatedDeviceId: null,
              inspectorNodeId: null,
              alertMessage: null,
            });
            return true;
          }
        } catch (e) {
          console.error('Error al importar JSON:', e);
        }
        return false;
      },

      dismissAlert: () => set({ alertMessage: null }),

      setEnvelopeMode: (enabled) =>
        set({
          isEnvelopeMode: enabled,
          envelopeSourceId: null,
          activePingBanner: enabled ? '✉️ MODO SOBRE ACTIVO: Haz clic en el equipo ORIGEN' : null,
        }),

      handleNodeClickEnvelope: async (nodeId) => {
        const { envelopeSourceId, runVisualPingPath } = get();
        if (!envelopeSourceId) {
          set({
            envelopeSourceId: nodeId,
            activePingBanner: '✉️ ORIGEN FIJADO. Ahora haz clic en el equipo DESTINO para enviar el sobre...',
          });
        } else {
          const srcId = envelopeSourceId;
          set({
            envelopeSourceId: null,
            isEnvelopeMode: false,
            activePingBanner: '🚀 ENVIANDO PAQUETE PDU A TRAVÉS DE LOS CABLES...',
          });
          await runVisualPingPath(srcId, nodeId);
          setTimeout(() => set({ activePingBanner: null }), 4000);
        }
      },

      runVisualPingPath: async (sourceId, targetId) => {
        const { nodes, edges } = get();
        const src = nodes.find((n) => n.id === sourceId);
        const tgt = nodes.find((n) => n.id === targetId);

        if (!src || !tgt) return false;

        if (src.data.isPoweredOn === false || tgt.data.isPoweredOn === false) {
          set({
            isSimulatingPing: false,
            pingLogs: [
              `❌ ERROR DE ENERGÍA: Uno de los dispositivos está apagado (Power OFF).`,
              `No es posible transmitir paquetes a través de interfaces sin alimentación.`,
            ],
            activePingBanner: '❌ ERROR: Dispositivo apagado',
          });
          return false;
        }

        set({
          isSimulatingPing: true,
          activePingBanner: `📤 Enviando ICMP Echo desde [${src.data.label}] hacia [${tgt.data.label}]...`,
          pingLogs: [
            `Iniciando prueba ICMP Echo Request visual paso a paso...`,
            `Origen: [${src.data.label}] (${(src.data.ip as string) || 'DHCP'})`,
            `Destino: [${tgt.data.label}] (${(tgt.data.ip as string) || 'DHCP'})`,
            `Trazando ruta de conmutación L2 / L3...`,
          ],
        });

        // BFS con reconstrucción de ruta de cables
        const poweredOnNodes = new Set(
          nodes.filter((n) => n.data.isPoweredOn !== false).map((n) => n.id)
        );

        const adj = new Map<string, Array<{ neighbor: string; edge: Edge }>>();
        edges.forEach((e) => {
          if (poweredOnNodes.has(e.source) && poweredOnNodes.has(e.target)) {
            if (!adj.has(e.source)) adj.set(e.source, []);
            if (!adj.has(e.target)) adj.set(e.target, []);
            adj.get(e.source)!.push({ neighbor: e.target, edge: e });
            adj.get(e.target)!.push({ neighbor: e.source, edge: e });
          }
        });

        const visited = new Set<string>();
        const queue: string[] = [sourceId];
        visited.add(sourceId);
        const prev = new Map<string, { fromNode: string; edge: Edge }>();

        let reachable = false;

        while (queue.length > 0) {
          const curr = queue.shift()!;
          if (curr === targetId) {
            reachable = true;
            break;
          }
          const neighbors = adj.get(curr) || [];
          for (const item of neighbors) {
            if (!visited.has(item.neighbor)) {
              visited.add(item.neighbor);
              prev.set(item.neighbor, { fromNode: curr, edge: item.edge });
              queue.push(item.neighbor);
            }
          }
        }

        if (!reachable) {
          set({
            isSimulatingPing: false,
            activePingBanner: '❌ Falló el enlace: Destino inalcanzable',
            pingLogs: [
              ...get().pingLogs,
              `Destino inalcanzable (Destination Host Unreachable).`,
              `Tiempo de espera agotado (Request timed out).`,
              `❌ FALLÓ EL ENLACE: No existe cableado continuo o hay un equipo intermedio apagado.`,
            ],
          });
          return false;
        }

        // Reconstruir lista ordenada de cables de origen a destino
        const pathEdges: Array<{ edgeId: string; direction: 'forward' | 'reverse' }> = [];
        let currNode = targetId;
        while (currNode !== sourceId) {
          const p = prev.get(currNode);
          if (!p) break;
          pathEdges.unshift({
            edgeId: p.edge.id,
            direction: p.edge.source === p.fromNode ? 'forward' : 'reverse',
          });
          currNode = p.fromNode;
        }

        const HOP_DURATION = 1300;

        // 1. IDA: Animar el sobre ✉️ viajando suavemente por cada cable hacia el destino
        for (const hop of pathEdges) {
          set({
            animatingPackets: {
              [hop.edgeId]: {
                direction: hop.direction,
                color: '#00f0ff',
                label: '✉️ Echo Req',
                duration: HOP_DURATION,
              },
            },
          });
          await new Promise((r) => setTimeout(r, HOP_DURATION));
          set({ animatingPackets: {} });
          await new Promise((r) => setTimeout(r, 60));
        }

        // Pausa en el destino (procesamiento ICMP)
        set({
          activePingBanner: `📥 [${tgt.data.label}] procesando paquete ICMP (TTL=64)...`,
        });
        await new Promise((r) => setTimeout(r, 600));

        // 2. VUELTA: Animar el sobre ✉️ de regreso hacia el origen
        for (let i = pathEdges.length - 1; i >= 0; i--) {
          const hop = pathEdges[i];
          set({
            animatingPackets: {
              [hop.edgeId]: {
                direction: hop.direction === 'forward' ? 'reverse' : 'forward',
                color: '#10b981',
                label: '✅ Echo Reply',
                duration: HOP_DURATION,
              },
            },
          });
          await new Promise((r) => setTimeout(r, HOP_DURATION));
          set({ animatingPackets: {} });
          await new Promise((r) => setTimeout(r, 60));
        }

        const logs = [
          ...get().pingLogs,
          `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=0.9ms TTL=64`,
          `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=1.1ms TTL=64`,
          `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=0.8ms TTL=64`,
          `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=0.7ms TTL=64`,
          `✅ PAQUETE ICMP ENTREGADO Y RESPONDIDO CON ÉXITO (0% de pérdida).`,
        ];

        set({
          isSimulatingPing: false,
          activePingBanner: `✅ PING EXITOSO: [${src.data.label}] ↔ [${tgt.data.label}] (0% pérdida)`,
          pingLogs: logs,
        });

        return true;
      },

      runBroadcastPingFromRouter: async () => {
        const { nodes, edges } = get();
        const routerNode = nodes.find(
          (n) => (n.data.deviceType as string)?.startsWith('router') && n.data.isPoweredOn !== false
        );

        if (!routerNode) return 0;

        const HOP_DURATION = 1300;

        set({
          isSimulatingPing: true,
          activePingBanner: '📡 BARRIDO BROADCAST: Transmitiendo desde el Router a TODA la red...',
          pingLogs: [
            `Iniciando Barrido Broadcast / ARP Sweep desde [${routerNode.data.label}]...`,
            `Transmitiendo tramas Ethernet Broadcast (FF:FF:FF:FF:FF:FF) hacia los Switches...`,
          ],
        });

        // 1. Cables directos conectados al router
        const routerEdges = edges.filter(
          (e) => e.source === routerNode.id || e.target === routerNode.id
        );

        const p1: Record<string, ActivePacketInfo> = {};
        routerEdges.forEach((e) => {
          p1[e.id] = {
            direction: e.source === routerNode.id ? 'forward' : 'reverse',
            color: '#facc15',
            label: '📡 Broadcast',
            duration: HOP_DURATION,
          };
        });
        set({ animatingPackets: p1 });
        await new Promise((r) => setTimeout(r, HOP_DURATION));
        set({ animatingPackets: {} });
        await new Promise((r) => setTimeout(r, 100));

        // 2. Cables del Switch hacia todas las máquinas (flujo simultáneo masivo!)
        const otherEdges = edges.filter((e) => !routerEdges.some((re) => re.id === e.id));
        const p2: Record<string, ActivePacketInfo> = {};
        otherEdges.forEach((e) => {
          p2[e.id] = {
            direction: 'forward',
            color: '#00f0ff',
            label: '✉️ PDU Ping',
            duration: HOP_DURATION + 200,
          };
        });

        set({
          animatingPackets: p2,
          activePingBanner: '🔀 SWITCH CORE: Reenviando paquetes simultáneamente a todos los puestos...',
          pingLogs: [
            ...get().pingLogs,
            `Switch Central L2/L3 inunda puertos de acceso con solicitudes de descubrimiento...`,
          ],
        });
        await new Promise((r) => setTimeout(r, HOP_DURATION + 200));
        set({ animatingPackets: {} });

        // Pausa en máquinas destino
        set({
          activePingBanner: '💻 TODAS LAS MÁQUINAS: Procesando tramas y preparando respuestas...',
        });
        await new Promise((r) => setTimeout(r, 500));

        // 3. Respuesta masiva de vuelta desde cada máquina
        const p3: Record<string, ActivePacketInfo> = {};
        otherEdges.forEach((e) => {
          p3[e.id] = {
            direction: 'reverse',
            color: '#10b981',
            label: '✅ Echo Reply',
            duration: HOP_DURATION + 200,
          };
        });

        set({
          animatingPackets: p3,
          activePingBanner: '💻 TODAS LAS MÁQUINAS: Respondiendo con paquetes de confirmación...',
          pingLogs: [
            ...get().pingLogs,
            `Recibidas respuestas ARP / Echo de todos los puestos de Call Center, Sistemas y Gerencia.`,
          ],
        });
        await new Promise((r) => setTimeout(r, HOP_DURATION + 200));
        set({ animatingPackets: {} });
        await new Promise((r) => setTimeout(r, 100));

        // 4. Vuelta al router
        const p4: Record<string, ActivePacketInfo> = {};
        routerEdges.forEach((e) => {
          p4[e.id] = {
            direction: e.source === routerNode.id ? 'reverse' : 'forward',
            color: '#10b981',
            label: '✅ 100% OK',
            duration: HOP_DURATION,
          };
        });
        set({ animatingPackets: p4 });
        await new Promise((r) => setTimeout(r, HOP_DURATION));
        set({ animatingPackets: {} });

        set({
          animatingPackets: {},
          isSimulatingPing: false,
          activePingBanner: `✅ BARRIDO COMPLETADO: ${otherEdges.length + routerEdges.length} enlaces verificados con éxito (0% pérdida)`,
          pingLogs: [
            ...get().pingLogs,
            `✅ BARRIDO COMPLETADO: 100% de los hosts responden en menos de 1.2ms. Red totalmente operativa.`,
          ],
        });

        setTimeout(() => set({ activePingBanner: null }), 5000);
        return otherEdges.length;
      },

      runPingSimulation: async (sourceId, targetId) => {
        return get().runVisualPingPath(sourceId, targetId);
      },
    }),
    {
      equality: (past, current) =>
        JSON.stringify(past.nodes) === JSON.stringify(current.nodes) &&
        JSON.stringify(past.edges) === JSON.stringify(current.edges),
      limit: 50,
    }
  )
);
