import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Server, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemService {
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'failed';
  subState: string;
  pid?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

export function ServicesList() {
  const [services, setServices] = useState<SystemService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="status-icon active" />;
      case 'failed':
        return <XCircle size={14} className="status-icon failed" />;
      default:
        return <AlertCircle size={14} className="status-icon inactive" />;
    }
  };

  if (loading) {
    return (
      <Card title="System Services" icon={<Server size={18} />}>
        <div className="loading-spinner">Loading services...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="System Services" icon={<Server size={18} />}>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchServices} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </Card>
    );
  }

  const activeCount = services.filter((s) => s.status === 'active').length;
  const failedCount = services.filter((s) => s.status === 'failed').length;

  return (
    <Card title="System Services" icon={<Server size={18} />} className="services-card">
      <div className="services-summary">
        <span className="summary-item">
          <span className="summary-count active">{activeCount}</span> Active
        </span>
        <span className="summary-item">
          <span className="summary-count failed">{failedCount}</span> Failed
        </span>
        <span className="summary-item">
          <span className="summary-count total">{services.length}</span> Total
        </span>
      </div>

      <div className="services-list">
        {services.length === 0 ? (
          <div className="no-services">No services configured</div>
        ) : (
          services.map((service) => (
            <div
              key={service.name}
              className={`service-item status-${service.status}`}
            >
              <div className="service-status">
                {getStatusIcon(service.status)}
              </div>
              <div className="service-info">
                <span className="service-name">{service.name}</span>
                <span className="service-description">{service.description}</span>
              </div>
              <div className="service-meta">
                <span className={`service-state ${service.status}`}>
                  {service.subState}
                </span>
                {service.pid && (
                  <span className="service-pid">PID: {service.pid}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
