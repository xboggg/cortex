import { useSystemMetrics, useNetdataInfo } from '../hooks/useNetdata';
import { MetricGauge } from './MetricGauge';
import { Card } from './Card';
import { Network, Clock, Server } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function SystemOverview() {
  const { metrics, loading: metricsLoading, error: metricsError } = useSystemMetrics();
  const { info, loading: infoLoading } = useNetdataInfo();

  if (metricsLoading || infoLoading) {
    return (
      <Card title="System Overview" icon={<Server size={18} />}>
        <div className="loading-spinner">Loading...</div>
      </Card>
    );
  }

  if (metricsError) {
    return (
      <Card title="System Overview" icon={<Server size={18} />}>
        <div className="error-message">Failed to load metrics: {metricsError.message}</div>
      </Card>
    );
  }

  return (
    <Card title="System Overview" icon={<Server size={18} />}>
      <div className="system-info">
        {info && (
          <div className="server-details">
            <div className="detail-item">
              <span className="detail-label">Host</span>
              <span className="detail-value">{info.os_name} {info.os_version}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Kernel</span>
              <span className="detail-value">{info.kernel_version}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Architecture</span>
              <span className="detail-value">{info.architecture}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cores</span>
              <span className="detail-value">{info.cores_total}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">RAM</span>
              <span className="detail-value">{formatBytes(parseInt(info.ram_total))}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Disk</span>
              <span className="detail-value">{formatBytes(parseInt(info.total_disk_space))}</span>
            </div>
          </div>
        )}
      </div>

      <div className="gauges-grid">
        <MetricGauge
          label="CPU"
          value={metrics?.cpu || 0}
          unit="%"
        />
        <MetricGauge
          label="Memory"
          value={metrics?.memory || 0}
          unit="%"
        />
        <MetricGauge
          label="Disk"
          value={metrics?.disk || 0}
          unit="%"
        />
      </div>

      <div className="stats-row">
        <div className="stat-item">
          <Network size={16} />
          <span className="stat-label">Network In</span>
          <span className="stat-value">{formatBytes(metrics?.network.received || 0)}/s</span>
        </div>
        <div className="stat-item">
          <Network size={16} />
          <span className="stat-label">Network Out</span>
          <span className="stat-value">{formatBytes(metrics?.network.sent || 0)}/s</span>
        </div>
        <div className="stat-item">
          <Clock size={16} />
          <span className="stat-label">Uptime</span>
          <span className="stat-value">{formatUptime(metrics?.uptime || 0)}</span>
        </div>
      </div>
    </Card>
  );
}
