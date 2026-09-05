export type DeviceType =
  | 'switch-16'
  | 'switch-24'
  | 'switch-48'
  | 'router'
  | 'pc'
  | 'laptop'
  | 'server'
  | 'phone'
  | 'ap'
  | 'text-note'
  | 'zone';

export type CableType = 'utp-cat6' | 'fiber-sfp' | 'auto';

export interface SwitchNodeData {
  label: string;
  deviceType: 'switch-16' | 'switch-24' | 'switch-48';
  maxPorts: number;
  ip: string;
  vlan: string;
  model: string;
  isIsolated?: boolean;
}

export interface RouterNodeData {
  label: string;
  deviceType: 'router';
  ip: string;
  gateway: string;
  model: string;
  isIsolated?: boolean;
}

export interface WorkstationNodeData {
  label: string;
  deviceType: 'pc' | 'laptop' | 'server' | 'phone' | 'ap';
  ip: string;
  mac: string;
  vlan: string;
  status: 'online' | 'offline' | 'transmitting';
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
}

export interface CableEdgeData {
  cableType: CableType;
  speed: string;
  status: 'active' | 'transmitting' | 'down';
  animated?: boolean;
}
