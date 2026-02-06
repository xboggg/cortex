import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Box, Play, Square, Pause, RefreshCw } from 'lucide-react';

interface DockerContainer {
  id: string;
  name: string;
  status: string;
  state: 'running' | 'exited' | 'paused' | 'created';
  image: string;
  ports: string;
  created: string;
}

// This will fetch from our backend API that runs on the server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

export function ContainersList() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/containers`);
      if (!response.ok) throw new Error('Failed to fetch containers');
      const data = await response.json();
      setContainers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'running':
        return <Play size={14} className="status-icon running" />;
      case 'exited':
        return <Square size={14} className="status-icon stopped" />;
      case 'paused':
        return <Pause size={14} className="status-icon paused" />;
      default:
        return <Box size={14} className="status-icon" />;
    }
  };

  const getStateClass = (state: string) => {
    switch (state) {
      case 'running':
        return 'status-running';
      case 'exited':
        return 'status-stopped';
      case 'paused':
        return 'status-paused';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card title="Docker Containers" icon={<Box size={18} />}>
        <div className="loading-spinner">Loading containers...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Docker Containers" icon={<Box size={18} />}>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchContainers} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </Card>
    );
  }

  const runningCount = containers.filter((c) => c.state === 'running').length;
  const stoppedCount = containers.filter((c) => c.state === 'exited').length;

  return (
    <Card
      title="Docker Containers"
      icon={<Box size={18} />}
      className="containers-card"
    >
      <div className="containers-summary">
        <span className="summary-item">
          <span className="summary-count running">{runningCount}</span> Running
        </span>
        <span className="summary-item">
          <span className="summary-count stopped">{stoppedCount}</span> Stopped
        </span>
        <span className="summary-item">
          <span className="summary-count total">{containers.length}</span> Total
        </span>
      </div>

      <div className="containers-list">
        {containers.length === 0 ? (
          <div className="no-containers">No containers found</div>
        ) : (
          containers.map((container) => (
            <div
              key={container.id}
              className={`container-item ${getStateClass(container.state)}`}
            >
              <div className="container-status">
                {getStateIcon(container.state)}
              </div>
              <div className="container-info">
                <span className="container-name">{container.name}</span>
                <span className="container-image">{container.image}</span>
              </div>
              <div className="container-meta">
                <span className="container-status-text">{container.status}</span>
                {container.ports && (
                  <span className="container-ports">{container.ports}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
