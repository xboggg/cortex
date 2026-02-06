import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Clock, CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CronJob {
  name: string;
  schedule: string;
  command: string;
  lastRun: string | null;
  lastStatus: 'success' | 'failed' | 'running' | 'unknown';
  lastDuration: number | null;
  nextRun: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

export function CronJobs() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/crons`);
      if (!response.ok) throw new Error('Failed to fetch cron jobs');
      const data = await response.json();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={14} className="status-icon success" />;
      case 'failed':
        return <XCircle size={14} className="status-icon failed" />;
      case 'running':
        return <Loader size={14} className="status-icon running spin" />;
      default:
        return <Clock size={14} className="status-icon unknown" />;
    }
  };

  if (loading) {
    return (
      <Card title="Cron Jobs" icon={<Clock size={18} />}>
        <div className="loading-spinner">Loading cron jobs...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Cron Jobs" icon={<Clock size={18} />}>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchJobs} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Cron Jobs" icon={<Clock size={18} />} className="cron-card">
      <div className="cron-list">
        {jobs.length === 0 ? (
          <div className="no-crons">No cron jobs configured</div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.name}
              className={`cron-item status-${job.lastStatus}`}
            >
              <div className="cron-status">
                {getStatusIcon(job.lastStatus)}
              </div>
              <div className="cron-info">
                <span className="cron-name">{job.name}</span>
                <span className="cron-schedule">{job.schedule}</span>
              </div>
              <div className="cron-meta">
                {job.lastRun && (
                  <span className="cron-last-run">
                    Last: {formatDistanceToNow(new Date(job.lastRun), { addSuffix: true })}
                  </span>
                )}
                {job.lastDuration !== null && (
                  <span className="cron-duration">{job.lastDuration}s</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
