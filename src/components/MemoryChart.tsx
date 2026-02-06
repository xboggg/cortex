import { useChartData } from '../hooks/useNetdata';
import { Card } from './Card';
import { MemoryStick } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function MemoryChart() {
  const { data, loading, error } = useChartData('system.ram', -300, 2000);

  if (loading) {
    return (
      <Card title="Memory Usage" icon={<MemoryStick size={18} />}>
        <div className="chart-loading">Loading...</div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="Memory Usage" icon={<MemoryStick size={18} />}>
        <div className="chart-error">Failed to load memory data</div>
      </Card>
    );
  }

  // Transform data for recharts
  const labels = data.labels;
  const usedIdx = labels.findIndex((l) => l === 'used');
  const cachedIdx = labels.findIndex((l) => l === 'cached');
  const buffersIdx = labels.findIndex((l) => l === 'buffers');
  const freeIdx = labels.findIndex((l) => l === 'free');

  const chartData = data.data.map((row) => {
    const timestamp = row[0] * 1000;
    const used = row[usedIdx] || 0;
    const cached = row[cachedIdx] || 0;
    const buffers = row[buffersIdx] || 0;
    const free = row[freeIdx] || 0;
    const total = used + cached + buffers + free;

    return {
      time: new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      used: total > 0 ? (used / total) * 100 : 0,
      cached: total > 0 ? (cached / total) * 100 : 0,
      buffers: total > 0 ? (buffers / total) * 100 : 0,
    };
  });

  return (
    <Card title="Memory Usage" icon={<MemoryStick size={18} />}>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="memUsedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-purple)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-purple)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="memCachedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-blue)" stopOpacity={0} />
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
              domain={[0, 100]}
              stroke="var(--color-text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
              formatter={(value, name) => [
                `${(value as number).toFixed(1)}%`,
                (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
              ]}
            />
            <Area
              type="monotone"
              dataKey="cached"
              stackId="1"
              stroke="var(--color-blue)"
              fill="url(#memCachedGradient)"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="used"
              stackId="1"
              stroke="var(--color-purple)"
              fill="url(#memUsedGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-purple)' }} />
          Used
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: 'var(--color-blue)' }} />
          Cached
        </span>
      </div>
    </Card>
  );
}
