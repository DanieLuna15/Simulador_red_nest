export type DeviceType =
  // Switches & Hubs
  | 'switch-48'
  | 'switch-24'
  | 'switch-16'
  | 'switch-8'
  | 'hub-5'
  // Routers & Perímetro
  | 'router'
  | 'firewall'
  | 'ont'
  | 'cloud'
  // Servidores
  | 'server-web'
  | 'server-dns'
  | 'server-db'
  | 'server-nas'
  // Terminales
  | 'pc'
  | 'laptop'
  | 'smartphone'
  | 'phone'
  | 'printer'
  | 'camera'
  | 'ap'
  | 'iot'
  // Anotaciones
  | 'text-note'
  | 'zone';

export type CableType =
  | 'auto'
  | 'utp-cat6'
  | 'utp-crossover'
  | 'fiber-sfp'
  | 'wireless'
  | 'serial-wan';

export interface BaseDeviceData {
  label: string;
  deviceType: DeviceType;
  isPoweredOn?: boolean;
  ip?: string;
  subnetMask?: string;
  gateway?: string;
  dnsServer?: string;
  dhcpEnabled?: boolean;
  mac?: string;
  vlan?: string;
  model?: string;
  isIsolated?: boolean;
}

export interface SwitchNodeData extends BaseDeviceData {
  deviceType: 'switch-48' | 'switch-24' | 'switch-16' | 'switch-8' | 'hub-5';
  maxPorts: number;
}

export interface RouterNodeData extends BaseDeviceData {
  deviceType: 'router' | 'firewall' | 'ont' | 'cloud';
  firewallRulesCount?: number;
}

export interface ServerNodeData extends BaseDeviceData {
  deviceType: 'server-web' | 'server-dns' | 'server-db' | 'server-nas';
  webContent?: string;
  dhcpPool?: {
    startIp: string;
    endIp: string;
    subnetMask: string;
    gateway: string;
  };
  dnsRecords?: Record<string, string>;
}

export interface WorkstationNodeData extends BaseDeviceData {
  deviceType: 'pc' | 'laptop' | 'smartphone' | 'phone' | 'printer' | 'camera' | 'ap' | 'iot';
  status?: 'online' | 'offline' | 'transmitting';
}

export interface TextNoteNodeData {
  label: string;
  color: string;
  fontSize: number;
  badgeStyle: 'normal' | 'badge' | 'glow' | 'pill';
}

export interface ZoneNodeData {
  label: string;
  color: string;
  width: number;
  height: number;
  isBackground?: boolean;
}

export interface CableEdgeData {
  cableType: CableType;
  speed: string;
  status: 'active' | 'transmitting' | 'down';
  animated?: boolean;
}
