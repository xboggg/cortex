import { useChartData } from '../hooks/useNetdata';
import { Card } from './Card';
import { Network } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function NetworkChart() {
  const { data, loading, error } = useChartData('system.net', -300, 2000);

  if (loading) {
    return (
      <Card title="Network Traffic" icon={<Network size={18} />}>
        <div className="chart-loading">Loading...</div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Network Traffic" icon={<Network size={18} />}>
        <div className="chart-error">Failed to load network data</div>
      </Card>
    );
  }

  const labels = data.labels;
  const recvIdx = labels.findIndex((l) => l === 'received');
  const sentIdx = labels.findIndex((l) => l === 'sent');

  const chartData = data.data.map((row) => {
    const timestamp = row[0] * 1000;
    return {
      time: new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      received: Math.abs(row[recvIdx] || 0),
      sent: Math.abs(row[sentIdx] || 0),
    };
  });

  return (
    <Card title="Network Traffic" icon={<Network size={18} />}>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netRecvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-green)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-green)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netSentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-yellow)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-yellow)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="time"
              stroke="var(--color-text-secondary)"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--color-text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatBytes(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              formatter={(value, name) => [
                `${formatBytes(value as number)}/s`,
                name === 'received' ? 'Download' : 'Upload',
              ]}
            />
            <Area
              type="monotone"
              dataKey="received"
              stroke="var(--color-green)"
              fill="url(#netRecvGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="sent"
              stroke="var(--color-yellow)"
              fill="url(#netSentGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-green)' }} />
          Download
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-yellow)' }} />
          Upload
        </span>
      </div>
    </Card>
  );
}
