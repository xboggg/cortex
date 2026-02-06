import { useChartData } from '../hooks/useNetdata';
import { Card } from './Card';
import { Cpu } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function CPUChart() {
  const { data, loading, error } = useChartData('system.cpu', -300, 2000);

  if (loading) {
    return (
      <Card title="CPU Usage" icon={<Cpu size={18} />}>
        <div className="chart-loading">Loading...</div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card title="CPU Usage" icon={<Cpu size={18} />}>
        <div className="chart-error">Failed to load CPU data</div>
      </Card>
    );
  }

  // Transform data for recharts
  const chartData = data.data.map((row) => {
    const timestamp = row[0] * 1000;
    const values = row.slice(1);
    const total = values.reduce((sum, val) => sum + (val || 0), 0);

    return {
      time: new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      usage: Math.min(total, 100),
    };
  });

  return (
    <Card title="CPU Usage" icon={<Cpu size={18} />}>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-blue)" stopOpacity={0.4} />
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
              formatter={(value) => [`${(value as number).toFixed(1)}%`, 'CPU']}
            />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="var(--color-blue)"
              fill="url(#cpuGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
