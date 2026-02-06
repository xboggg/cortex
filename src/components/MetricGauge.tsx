interface MetricGaugeProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export function MetricGauge({
  label,
  value,
  max = 100,
  unit = '%',
  color = 'blue',
  size = 'md',
}: MetricGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);

  // Auto-color based on value for percentage metrics
  const getAutoColor = () => {
    if (unit === '%') {
      if (percentage >= 90) return 'red';
      if (percentage >= 70) return 'yellow';
      return 'green';
    }
    return color;
  };

  const actualColor = color === 'blue' && unit === '%' ? getAutoColor() : color;

  const sizeClasses = {
    sm: 'gauge-sm',
    md: 'gauge-md',
    lg: 'gauge-lg',
  };

  return (
    <div className={`metric-gauge ${sizeClasses[size]}`}>
      <div className="gauge-circle">
        <svg viewBox="0 0 100 100" className="gauge-svg">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          {/* Value arc */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={`var(--color-${actualColor})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.64} 264`}
            transform="rotate(-90 50 50)"
            className="gauge-value"
          />
        </svg>
        <div className="gauge-text">
          <span className="gauge-value-text">{value.toFixed(1)}</span>
          <span className="gauge-unit">{unit}</span>
        </div>
      </div>
      <span className="gauge-label">{label}</span>
    </div>
  );
}
