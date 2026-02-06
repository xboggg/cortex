// Netdata API Types

export interface NetdataInfo {
  version: string;
  uid: string;
  'hosts-available': number;
  os_name: string;
  os_version: string;
  kernel_name: string;
  kernel_version: string;
  architecture: string;
  virtualization: string;
  cores_total: string;
  ram_total: string;
  total_disk_space: string;
}

export interface ChartData {
  id: string;
  name: string;
  type: string;
  family: string;
  context: string;
  title: string;
  units: string;
  data_url: string;
  chart_type: string;
  dimensions: Record<string, DimensionInfo>;
}

export interface DimensionInfo {
  name: string;
}

export interface DataPoint {
  time: number;
  [key: string]: number;
}

export interface ChartDataResponse {
  labels: string[];
  data: number[][];
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    received: number;
    sent: number;
  };
  uptime: number;
}

export interface Container {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'paused';
  cpu: number;
  memory: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: Date | null;
  nextRun: Date | null;
  status: 'success' | 'failed' | 'running' | 'pending';
  duration?: number;
}

export interface Service {
  name: string;
  status: 'active' | 'inactive' | 'failed';
  pid?: number;
  memory?: number;
  cpu?: number;
}

export interface Alarm {
  id: string;
  name: string;
  chart: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  value: number;
  last_updated: number;
}
