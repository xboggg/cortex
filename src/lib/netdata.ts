// Netdata API Client

import type { NetdataInfo, ChartData, SystemMetrics, Container, Alarm } from '../types/netdata';

// Will be configured via environment or settings
const NETDATA_URL = import.meta.env.VITE_NETDATA_URL || 'http://localhost:19999';

class NetdataClient {
  private baseUrl: string;

  constructor(baseUrl: string = NETDATA_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Netdata API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getInfo(): Promise<NetdataInfo> {
    return this.fetch<NetdataInfo>('/api/v1/info');
  }

  async getCharts(): Promise<Record<string, ChartData>> {
    const response = await this.fetch<{ charts: Record<string, ChartData> }>('/api/v1/charts');
    return response.charts;
  }

  async getChartData(chart: string, after = -60, before = 0, points = 60): Promise<{ labels: string[]; data: number[][] }> {
    return this.fetch(`/api/v1/data?chart=${chart}&after=${after}&before=${before}&points=${points}&format=json`);
  }

  async getAlarms(): Promise<{ alarms: Record<string, Alarm> }> {
    return this.fetch('/api/v1/alarms');
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    const [cpuData, memData, diskData, netData, uptimeData] = await Promise.all([
      this.getChartData('system.cpu', -1, 0, 1).catch(() => null),
      this.getChartData('system.ram', -1, 0, 1).catch(() => null),
      this.getChartData('disk_space._', -1, 0, 1).catch(() => null),
      this.getChartData('system.net', -1, 0, 1).catch(() => null),
      this.getChartData('system.uptime', -1, 0, 1).catch(() => null),
    ]);

    // Calculate CPU usage (sum of all non-idle)
    let cpu = 0;
    if (cpuData?.data?.[0]) {
      const values = cpuData.data[0].slice(1); // Skip timestamp
      cpu = values.reduce((sum: number, val: number) => sum + (val || 0), 0);
    }

    // Memory usage
    let memory = 0;
    if (memData?.data?.[0]) {
      const labels = memData.labels;
      const values = memData.data[0];
      const usedIdx = labels.findIndex((l: string) => l === 'used');
      const cachedIdx = labels.findIndex((l: string) => l === 'cached');
      const buffersIdx = labels.findIndex((l: string) => l === 'buffers');
      const freeIdx = labels.findIndex((l: string) => l === 'free');

      const used = values[usedIdx] || 0;
      const cached = values[cachedIdx] || 0;
      const buffers = values[buffersIdx] || 0;
      const free = values[freeIdx] || 0;
      const total = used + cached + buffers + free;
      memory = total > 0 ? ((used) / total) * 100 : 0;
    }

    // Disk usage
    let disk = 0;
    if (diskData?.data?.[0]) {
      const labels = diskData.labels;
      const values = diskData.data[0];
      const usedIdx = labels.findIndex((l: string) => l === 'used');
      const availIdx = labels.findIndex((l: string) => l === 'avail');

      const used = values[usedIdx] || 0;
      const avail = values[availIdx] || 0;
      const total = used + avail;
      disk = total > 0 ? (used / total) * 100 : 0;
    }

    // Network
    let received = 0, sent = 0;
    if (netData?.data?.[0]) {
      const labels = netData.labels;
      const values = netData.data[0];
      const recvIdx = labels.findIndex((l: string) => l === 'received');
      const sentIdx = labels.findIndex((l: string) => l === 'sent');
      received = Math.abs(values[recvIdx] || 0);
      sent = Math.abs(values[sentIdx] || 0);
    }

    // Uptime
    let uptime = 0;
    if (uptimeData?.data?.[0]) {
      uptime = uptimeData.data[0][1] || 0;
    }

    return {
      cpu,
      memory,
      disk,
      network: { received, sent },
      uptime,
    };
  }

  async getContainers(): Promise<Container[]> {
    const charts = await this.getCharts();
    const containerCharts = Object.keys(charts).filter(
      (key) => key.startsWith('cgroup_') || key.startsWith('docker_')
    );

    const containers: Container[] = [];
    const containerNames = new Set<string>();

    for (const chartKey of containerCharts) {
      const match = chartKey.match(/(?:cgroup_|docker_)([^.]+)/);
      if (match) {
        containerNames.add(match[1]);
      }
    }

    for (const name of containerNames) {
      try {
        const cpuChart = `cgroup_${name}.cpu`;
        const memChart = `cgroup_${name}.mem`;

        const [cpuData, memData] = await Promise.all([
          this.getChartData(cpuChart, -1, 0, 1).catch(() => null),
          this.getChartData(memChart, -1, 0, 1).catch(() => null),
        ]);

        containers.push({
          id: name,
          name: name.replace(/_/g, ' '),
          status: 'running',
          cpu: cpuData?.data?.[0]?.[1] || 0,
          memory: memData?.data?.[0]?.[1] || 0,
          memoryLimit: 0,
          networkRx: 0,
          networkTx: 0,
        });
      } catch {
        // Container might not have all metrics
      }
    }

    return containers;
  }
}

export const netdata = new NetdataClient();
export default netdata;
