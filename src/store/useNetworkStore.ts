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
import { DeviceType } from '../types/network';

interface NetworkState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isolatedDeviceId: string | null;
  activeScenarioId: string;
  isSimulatingPing: boolean;
  pingLogs: string[];
  alertMessage: string | null;

  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => boolean;

  // Custom actions
  setSelectedNodeId: (id: string | null) => void;
  setIsolatedDeviceId: (id: string | null) => void;
  addDevice: (type: DeviceType, position?: { x: number; y: number }) => void;
  addTextNote: (label?: string, color?: string, position?: { x: number; y: number }) => void;
  addZone: (label?: string, color?: string, position?: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
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
      nodes: defaultScenarios.opcion1.nodes,
      edges: defaultScenarios.opcion1.edges,
      selectedNodeId: null,
      isolatedDeviceId: null,
      activeScenarioId: 'opcion1',
      isSimulatingPing: false,
      pingLogs: [],
      alertMessage: null,

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
        const { nodes, edges } = get();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);

        if (!sourceNode || !targetNode) return false;

        // Validar límite de puertos en Switches
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

        // Determinar tipo de cable por defecto
        const isFiber =
          (sourceNode.type === 'routerNode' && targetNode.type === 'switchNode') ||
          (sourceNode.type === 'switchNode' && targetNode.type === 'switchNode');

        const newEdge: Edge = {
          id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
          type: 'networkCableEdge',
          data: {
            cableType: isFiber ? 'fiber-sfp' : 'utp-cat6',
            speed: isFiber ? '10 Gbps SFP+' : '1 Gbps Cat6',
            status: 'active',
            animated: isFiber,
          },
        };

        set({
          edges: addEdge(newEdge, edges),
          alertMessage: null,
        });
        return true;
      },

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      setIsolatedDeviceId: (id) => {
        set({ isolatedDeviceId: get().isolatedDeviceId === id ? null : id });
      },

      addDevice: (type, position) => {
        const pos = position || {
          x: 350 + Math.random() * 100,
          y: 250 + Math.random() * 100,
        };
        const id = `${type}-${Date.now()}`;

        let newNode: Node;

        if (type.startsWith('switch')) {
          const maxPorts = type === 'switch-48' ? 48 : type === 'switch-16' ? 16 : 24;
          newNode = {
            id,
            type: 'switchNode',
            position: pos,
            data: {
              label: `SW-${maxPorts}P-${Math.floor(10 + Math.random() * 90)}`,
              deviceType: type,
              maxPorts,
              ip: `192.168.1.${Math.floor(2 + Math.random() * 20)}`,
              vlan: 'VLAN 1 (Nativa)',
              model: `Switch Administrable ${maxPorts} Puertos L2+`,
            },
          };
        } else if (type === 'router') {
          newNode = {
            id,
            type: 'routerNode',
            position: pos,
            data: {
              label: `Router-GW-${Math.floor(10 + Math.random() * 90)}`,
              deviceType: 'router',
              ip: '192.168.1.1',
              gateway: '0.0.0.0/0 (Fibra)',
              model: 'MikroTik CCR2004 / Fortinet 60F',
            },
          };
        } else if (type === 'text-note') {
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
            data: {
              label: 'NUEVA ÁREA DE OFICINA',
              color: '#3b82f6',
              width: 380,
              height: 220,
            },
            draggable: true,
          };
        } else {
          // Workstation
          const devLabels: Record<string, string> = {
            pc: 'PC-OFICINA',
            laptop: 'LAPTOP-STAFF',
            server: 'SRV-STORAGE',
            phone: 'VoIP-PHONE',
            ap: 'AP-WIFI-6',
          };
          newNode = {
            id,
            type: 'workstationNode',
            position: pos,
            data: {
              label: `${devLabels[type] || 'DEVICE'}-${Math.floor(10 + Math.random() * 90)}`,
              deviceType: type,
              ip: `192.168.10.${Math.floor(20 + Math.random() * 200)}`,
              mac: `52:54:00:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
              vlan: 'VLAN 10',
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
          data: { label, color, width: 400, height: 260 },
        };
        set({ nodes: [newNode, ...get().nodes] }); // Zonas al fondo
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((node) => {
            if (node.id === id) {
              return { ...node, data: { ...node.data, ...data } };
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
        });
      },

      clearCanvas: () => {
        set({ nodes: [], edges: [], selectedNodeId: null, isolatedDeviceId: null });
      },

      loadScenario: (scenarioId) => {
        const scenario = defaultScenarios[scenarioId];
        if (scenario) {
          set({
            nodes: scenario.nodes,
            edges: scenario.edges,
            activeScenarioId: scenarioId,
            selectedNodeId: null,
            isolatedDeviceId: null,
            alertMessage: null,
          });
        }
      },

      exportScenarioJson: () => {
        const state = {
          version: '2.0.0',
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

      runPingSimulation: async (sourceId, targetId) => {
        const { nodes, edges } = get();
        const src = nodes.find((n) => n.id === sourceId);
        const tgt = nodes.find((n) => n.id === targetId);

        if (!src || !tgt) return false;

        set({
          isSimulatingPing: true,
          pingLogs: [
            `Iniciando prueba ICMP Echo Request...`,
            `Origen: [${src.data.label}] (${(src.data.ip as string) || 'DHCP'})`,
            `Destino: [${tgt.data.label}] (${(tgt.data.ip as string) || 'DHCP'})`,
            `Resolviendo tabla de reenvío ARP / MAC...`,
          ],
        });

        // Verificamos conectividad de grafo simple (BFS)
        const adj = new Map<string, string[]>();
        edges.forEach((e) => {
          if (!adj.has(e.source)) adj.set(e.source, []);
          if (!adj.has(e.target)) adj.set(e.target, []);
          adj.get(e.source)!.push(e.target);
          adj.get(e.target)!.push(e.source);
        });

        const visited = new Set<string>();
        const queue: string[] = [sourceId];
        visited.add(sourceId);
        let reachable = false;

        while (queue.length > 0) {
          const curr = queue.shift()!;
          if (curr === targetId) {
            reachable = true;
            break;
          }
          const neighbors = adj.get(curr) || [];
          for (const next of neighbors) {
            if (!visited.has(next)) {
              visited.add(next);
              queue.push(next);
            }
          }
        }

        await new Promise((r) => setTimeout(r, 600));

        if (reachable) {
          const logs = [
            ...get().pingLogs,
            `Enrutamiento establecido con éxito (0% pérdida de paquetes).`,
            `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=1.2ms TTL=64`,
            `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=0.8ms TTL=64`,
            `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=1.0ms TTL=64`,
            `Respuesta desde ${(tgt.data.ip as string) || '192.168.1.X'}: bytes=32 tiempo=0.9ms TTL=64`,
            `✅ ESTADO: CONEXIÓN EXITOSA (4 paquetes transmitidos, 4 recibidos).`,
          ];
          set({ pingLogs: logs, isSimulatingPing: false });
          return true;
        } else {
          const logs = [
            ...get().pingLogs,
            `Respuesta desde ${(src.data.ip as string) || '192.168.1.X'}: Host de destino inaccesible.`,
            `Tiempo de espera agotado para esta solicitud (Request timed out).`,
            `Tiempo de espera agotado para esta solicitud.`,
            `Tiempo de espera agotado para esta solicitud.`,
            `❌ ESTADO: FALLÓ (100% de pérdida de paquetes). No hay cableado continuo entre ambos nodos.`,
          ];
          set({ pingLogs: logs, isSimulatingPing: false });
          return false;
        }
      },
    }),
    {
      // Opciones de zundo: registrar cambios en nodes y edges
      equality: (past, current) =>
        JSON.stringify(past.nodes) === JSON.stringify(current.nodes) &&
        JSON.stringify(past.edges) === JSON.stringify(current.edges),
      limit: 50,
    }
  )
);
