import { Node, Edge } from '@xyflow/react';

export interface NetworkScenario {
  id: string;
  name: string;
  subtitle: string;
  nodes: Node[];
  edges: Edge[];
}

export const defaultScenarios: Record<string, NetworkScenario> = {
  opcion1: {
    id: 'opcion1',
    name: 'Opción 1: Switch 48P Centralizado (Recomendada)',
    subtitle: 'Switch L2+ 48 Puertos Gigabit PoE+ en Rack Sistemas • 31 Puertos Ocupados, 17 Libres',
    nodes: [
      // Zonas de fondo
      {
        id: 'zone-sistemas',
        type: 'zoneNode',
        position: { x: 460, y: 30 },
        zIndex: -1,
        style: { width: 680, height: 350 },
        data: { label: '🏢 RACK PRINCIPAL & SISTEMAS', color: '#00f0ff', width: 680, height: 350, isBackground: true },
        draggable: true,
        selectable: true,
      },
      {
        id: 'zone-callcenter',
        type: 'zoneNode',
        position: { x: 40, y: 430 },
        zIndex: -1,
        style: { width: 730, height: 330 },
        data: { label: '🎧 CALL CENTER (8 PUESTOS)', color: '#a855f7', width: 730, height: 330, isBackground: true },
        draggable: true,
        selectable: true,
      },
      {
        id: 'zone-admin',
        type: 'zoneNode',
        position: { x: 820, y: 430 },
        zIndex: -1,
        style: { width: 740, height: 330 },
        data: { label: '📊 ADMINISTRACIÓN & GERENCIA', color: '#22c55e', width: 740, height: 330, isBackground: true },
        draggable: true,
        selectable: true,
      },
      // Router Gateway
      {
        id: 'router-main',
        type: 'routerNode',
        position: { x: 500, y: 90 },
        data: {
          label: 'Router MikroTik CCR2004',
          deviceType: 'router',
          ip: '192.168.1.1',
          gateway: 'WAN Fibra AXS',
          model: 'MikroTik CCR2004-16G-2S+',
        },
      },
      // Switch Central 48P
      {
        id: 'switch-core-48',
        type: 'switchNode',
        position: { x: 800, y: 90 },
        data: {
          label: 'SW-CORE-48P',
          deviceType: 'switch-48',
          maxPorts: 48,
          ip: '192.168.1.2',
          vlan: 'VLAN 1 (Mgmt)',
          model: 'TP-Link Omada SG3452P (48 Puertos PoE+)',
        },
      },
      // Servidor en Sistemas
      {
        id: 'srv-01',
        type: 'workstationNode',
        position: { x: 500, y: 230 },
        data: { label: 'SRV-EDP-DATA', deviceType: 'server-web', ip: '192.168.1.10', mac: '00:50:56:A1:01:FE', vlan: 'VLAN 10', status: 'online' },
      },
      // AP Wi-Fi
      {
        id: 'ap-01',
        type: 'workstationNode',
        position: { x: 800, y: 230 },
        data: { label: 'AP-WIFI6-SISTEMAS', deviceType: 'ap', ip: '192.168.1.20', mac: 'AC:8B:A9:11:22:33', vlan: 'VLAN 50', status: 'online' },
      },
      // Call Center PCs
      {
        id: 'pc-cc01',
        type: 'workstationNode',
        position: { x: 70, y: 490 },
        data: { label: 'PC-CC-01', deviceType: 'pc', ip: '192.168.10.101', mac: 'D4:5D:64:12:01:01', vlan: 'VLAN 10 (CallCenter)', status: 'online' },
      },
      {
        id: 'pc-cc02',
        type: 'workstationNode',
        position: { x: 290, y: 490 },
        data: { label: 'PC-CC-02', deviceType: 'pc', ip: '192.168.10.102', mac: 'D4:5D:64:12:01:02', vlan: 'VLAN 10 (CallCenter)', status: 'online' },
      },
      {
        id: 'pc-cc03',
        type: 'workstationNode',
        position: { x: 510, y: 490 },
        data: { label: 'PC-CC-03', deviceType: 'pc', ip: '192.168.10.103', mac: 'D4:5D:64:12:01:03', vlan: 'VLAN 10 (CallCenter)', status: 'online' },
      },
      {
        id: 'phone-cc01',
        type: 'workstationNode',
        position: { x: 70, y: 610 },
        data: { label: 'VoIP-CC-01', deviceType: 'phone', ip: '192.168.20.201', mac: '00:15:65:44:01:01', vlan: 'VLAN 20 (Voz)', status: 'online' },
      },
      {
        id: 'phone-cc02',
        type: 'workstationNode',
        position: { x: 290, y: 610 },
        data: { label: 'VoIP-CC-02', deviceType: 'phone', ip: '192.168.20.202', mac: '00:15:65:44:01:02', vlan: 'VLAN 20 (Voz)', status: 'online' },
      },
      // Admin & Gerencia PCs
      {
        id: 'pc-gerencia',
        type: 'workstationNode',
        position: { x: 860, y: 490 },
        data: { label: 'PC-GERENCIA', deviceType: 'laptop', ip: '192.168.30.10', mac: '3C:22:FB:99:88:01', vlan: 'VLAN 30 (Gerencia)', status: 'online' },
      },
      {
        id: 'pc-admin01',
        type: 'workstationNode',
        position: { x: 1080, y: 490 },
        data: { label: 'PC-ADMIN-01', deviceType: 'pc', ip: '192.168.30.21', mac: '3C:22:FB:99:88:21', vlan: 'VLAN 30 (Admin)', status: 'online' },
      },
      {
        id: 'pc-admin02',
        type: 'workstationNode',
        position: { x: 1300, y: 490 },
        data: { label: 'PC-ADMIN-02', deviceType: 'pc', ip: '192.168.30.22', mac: '3C:22:FB:99:88:22', vlan: 'VLAN 30 (Admin)', status: 'online' },
      },
      // Notas adhesivas
      {
        id: 'note-01',
        type: 'textNoteNode',
        position: { x: 50, y: 50 },
        data: {
          label: '⚡ ENLACE DE ALTA VELOCIDAD\n• 48 Puertos Gigabit PoE+ para toda la oficina.\n• Elimina cuellos de botella y pérdidas de paquetes.',
          color: '#00f0ff',
          fontSize: 13,
          badgeStyle: 'glow',
        },
      },
    ],
    edges: [
      {
        id: 'e-router-sw48',
        source: 'router-main',
        target: 'switch-core-48',
        type: 'networkCableEdge',
        data: { cableType: 'fiber-sfp', speed: '10 Gbps SFP+', status: 'active', animated: true },
      },
      {
        id: 'e-sw48-srv01',
        source: 'switch-core-48',
        target: 'srv-01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
      {
        id: 'e-sw48-ap01',
        source: 'switch-core-48',
        target: 'ap-01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps PoE+', status: 'active' },
      },
      {
        id: 'e-sw48-pc01',
        source: 'switch-core-48',
        target: 'pc-cc01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
      {
        id: 'e-sw48-pc02',
        source: 'switch-core-48',
        target: 'pc-cc02',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
      {
        id: 'e-sw48-pc03',
        source: 'switch-core-48',
        target: 'pc-cc03',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
      {
        id: 'e-sw48-phone01',
        source: 'switch-core-48',
        target: 'phone-cc01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps PoE', status: 'active' },
      },
      {
        id: 'e-sw48-phone02',
        source: 'switch-core-48',
        target: 'phone-cc02',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps PoE', status: 'active' },
      },
      {
        id: 'e-sw48-gerencia',
        source: 'switch-core-48',
        target: 'pc-gerencia',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
      {
        id: 'e-sw48-admin01',
        source: 'switch-core-48',
        target: 'pc-admin01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
      {
        id: 'e-sw48-admin02',
        source: 'switch-core-48',
        target: 'pc-admin02',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps Cat6', status: 'active' },
      },
    ],
  },
  opcion2: {
    id: 'opcion2',
    name: 'Opción 2: 2x Switches 24P Distribuidos (Troncal SFP+)',
    subtitle: '1x Switch 24P Sistemas + 1x Switch 24P Administración unidos por Trunk 10G',
    nodes: [
      {
        id: 'router-main',
        type: 'routerNode',
        position: { x: 450, y: 60 },
        data: { label: 'Router MikroTik CCR', deviceType: 'router', ip: '192.168.1.1', gateway: 'WAN Fibra', model: 'CCR2004' },
      },
      {
        id: 'switch-sistemas-24',
        type: 'switchNode',
        position: { x: 260, y: 180 },
        data: { label: 'SW-SISTEMAS-24P', deviceType: 'switch-24', maxPorts: 24, ip: '192.168.1.2', vlan: 'VLAN 1', model: '24 Puertos PoE+' },
      },
      {
        id: 'switch-admin-24',
        type: 'switchNode',
        position: { x: 640, y: 180 },
        data: { label: 'SW-ADMIN-24P', deviceType: 'switch-24', maxPorts: 24, ip: '192.168.1.3', vlan: 'VLAN 1', model: '24 Puertos Gigabit' },
      },
      {
        id: 'pc-cc01',
        type: 'workstationNode',
        position: { x: 180, y: 360 },
        data: { label: 'PC-CC-01', deviceType: 'pc', ip: '192.168.10.101', mac: 'D4:5D:64:12:01:01', vlan: 'VLAN 10', status: 'online' },
      },
      {
        id: 'pc-cc02',
        type: 'workstationNode',
        position: { x: 320, y: 360 },
        data: { label: 'PC-CC-02', deviceType: 'pc', ip: '192.168.10.102', mac: 'D4:5D:64:12:01:02', vlan: 'VLAN 10', status: 'online' },
      },
      {
        id: 'pc-admin01',
        type: 'workstationNode',
        position: { x: 580, y: 360 },
        data: { label: 'PC-ADMIN-01', deviceType: 'pc', ip: '192.168.30.21', mac: '3C:22:FB:99:88:21', vlan: 'VLAN 30', status: 'online' },
      },
      {
        id: 'pc-admin02',
        type: 'workstationNode',
        position: { x: 720, y: 360 },
        data: { label: 'PC-ADMIN-02', deviceType: 'pc', ip: '192.168.30.22', mac: '3C:22:FB:99:88:22', vlan: 'VLAN 30', status: 'online' },
      },
      {
        id: 'note-02',
        type: 'textNoteNode',
        position: { x: 420, y: 280 },
        data: { label: '🔗 ENLACE TRONCAL SFP+ 10Gbps\nConexión de alta velocidad entre zonas', color: '#facc15', fontSize: 13, badgeStyle: 'badge' },
      },
    ],
    edges: [
      {
        id: 'e-router-sw-a',
        source: 'router-main',
        target: 'switch-sistemas-24',
        type: 'networkCableEdge',
        data: { cableType: 'fiber-sfp', speed: '10 Gbps', status: 'active' },
      },
      {
        id: 'e-sw-a-sw-b',
        source: 'switch-sistemas-24',
        target: 'switch-admin-24',
        type: 'networkCableEdge',
        data: { cableType: 'fiber-sfp', speed: '10 Gbps Trunk SFP+', status: 'active', animated: true },
      },
      {
        id: 'e-swa-pc1',
        source: 'switch-sistemas-24',
        target: 'pc-cc01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' },
      },
      {
        id: 'e-swa-pc2',
        source: 'switch-sistemas-24',
        target: 'pc-cc02',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' },
      },
      {
        id: 'e-swb-pc1',
        source: 'switch-admin-24',
        target: 'pc-admin01',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' },
      },
      {
        id: 'e-swb-pc2',
        source: 'switch-admin-24',
        target: 'pc-admin02',
        type: 'networkCableEdge',
        data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' },
      },
    ],
  },
  opcion3: {
    id: 'opcion3',
    name: 'Opción 3: Switch 24P Core + Switch 16P PoE Separado',
    subtitle: 'Switch 24P para Datos + Switch 16P dedicado a Telefonía VoIP y APs',
    nodes: [
      {
        id: 'router-main',
        type: 'routerNode',
        position: { x: 450, y: 60 },
        data: { label: 'Router Gateway', deviceType: 'router', ip: '192.168.1.1', gateway: 'WAN Fibra', model: 'MikroTik' },
      },
      {
        id: 'sw-core-24',
        type: 'switchNode',
        position: { x: 280, y: 180 },
        data: { label: 'SW-DATOS-24P', deviceType: 'switch-24', maxPorts: 24, ip: '192.168.1.2', vlan: 'VLAN 10/30', model: '24 Puertos Gigabit' },
      },
      {
        id: 'sw-poe-16',
        type: 'switchNode',
        position: { x: 620, y: 180 },
        data: { label: 'SW-VOIP-POE-16P', deviceType: 'switch-16', maxPorts: 16, ip: '192.168.1.3', vlan: 'VLAN 20', model: '16 Puertos PoE+' },
      },
      {
        id: 'pc-cc01',
        type: 'workstationNode',
        position: { x: 200, y: 350 },
        data: { label: 'PC-CC-01', deviceType: 'pc', ip: '192.168.10.101', mac: 'D4:5D:64:12:01:01', vlan: 'VLAN 10', status: 'online' },
      },
      {
        id: 'phone-cc01',
        type: 'workstationNode',
        position: { x: 620, y: 350 },
        data: { label: 'VoIP-CC-01', deviceType: 'phone', ip: '192.168.20.201', mac: '00:15:65:44:01:01', vlan: 'VLAN 20', status: 'online' },
      },
    ],
    edges: [
      { id: 'e-r-sw24', source: 'router-main', target: 'sw-core-24', type: 'networkCableEdge', data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' } },
      { id: 'e-r-sw16', source: 'router-main', target: 'sw-poe-16', type: 'networkCableEdge', data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' } },
      { id: 'e-sw24-pc', source: 'sw-core-24', target: 'pc-cc01', type: 'networkCableEdge', data: { cableType: 'utp-cat6', speed: '1 Gbps', status: 'active' } },
      { id: 'e-sw16-ph', source: 'sw-poe-16', target: 'phone-cc01', type: 'networkCableEdge', data: { cableType: 'utp-cat6', speed: '1 Gbps PoE', status: 'active' } },
    ],
  },
};
