import { useAlarms } from '../hooks/useNetdata';
import { Card } from './Card';
import { Bell, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export function AlertsPanel() {
  const { alarms, loading, error } = useAlarms();

  if (loading) {
    return (
      <Card title="Alerts" icon={<Bell size={18} />}>
        <div className="loading-spinner">Loading alerts...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Alerts" icon={<Bell size={18} />}>
        <div className="error-message">Failed to load alerts</div>
      </Card>
    );
  }

  const criticalAlarms = alarms.filter((a) => a.status === 'CRITICAL');
  const warningAlarms = alarms.filter((a) => a.status === 'WARNING');
  const okAlarms = alarms.filter((a) => a.status === 'OK');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return <AlertCircle size={14} className="alert-icon critical" />;
      case 'WARNING':
        return <AlertTriangle size={14} className="alert-icon warning" />;
      default:
        return <CheckCircle size={14} className="alert-icon ok" />;
    }
  };

  const activeAlarms = [...criticalAlarms, ...warningAlarms];

  return (
    <Card title="Alerts" icon={<Bell size={18} />} className="alerts-card">
      <div className="alerts-summary">
        <span className="summary-item">
          <span className="summary-count critical">{criticalAlarms.length}</span> Critical
        </span>
        <span className="summary-item">
          <span className="summary-count warning">{warningAlarms.length}</span> Warning
        </span>
        <span className="summary-item">
          <span className="summary-count ok">{okAlarms.length}</span> OK
        </span>
      </div>

      <div className="alerts-list">
        {activeAlarms.length === 0 ? (
          <div className="no-alerts">
            <CheckCircle size={24} className="no-alerts-icon" />
            <span>All systems operational</span>
          </div>
        ) : (
          activeAlarms.slice(0, 10).map((alarm) => (
            <div
              key={alarm.id}
              className={`alert-item status-${alarm.status.toLowerCase()}`}
            >
              <div className="alert-status">
                {getStatusIcon(alarm.status)}
              </div>
              <div className="alert-info">
                <span className="alert-name">{alarm.name}</span>
                <span className="alert-chart">{alarm.chart}</span>
              </div>
              <div className="alert-value">
                {typeof alarm.value === 'number' ? alarm.value.toFixed(2) : alarm.value}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
