import { useState, useEffect } from 'react';
import { Card } from './Card';
import { HardDrive, RefreshCw } from 'lucide-react';

interface DiskInfo {
  filesystem: string;
  size: string;
  used: string;
  available: string;
  percent: string;
  mountpoint: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500';

export function DiskUsage() {
  const [disks, setDisks] = useState<DiskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/disks`);
      if (!response.ok) throw new Error('Failed to fetch disk info');
      const data = await response.json();
      setDisks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisks();
    const interval = setInterval(fetchDisks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUsageColor = (percent: string) => {
    const value = parseInt(percent);
    if (value >= 90) return 'var(--color-red)';
    if (value >= 70) return 'var(--color-yellow)';
    return 'var(--color-green)';
  };

  if (loading) {
    return (
      <Card title="Disk Usage" icon={<HardDrive size={18} />}>
        <div className="loading-spinner">Loading disk info...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Disk Usage" icon={<HardDrive size={18} />}>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchDisks} className="retry-btn">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Disk Usage" icon={<HardDrive size={18} />} className="disk-card">
      <div className="disk-list">
        {disks.length === 0 ? (
          <div className="no-disks">No disk information available</div>
        ) : (
          disks.map((disk, index) => (
            <div key={index} className="disk-item">
              <div className="disk-header">
                <span className="disk-mount">{disk.mountpoint}</span>
                <span className="disk-filesystem">{disk.filesystem}</span>
              </div>
              <div className="disk-bar-container">
                <div
                  className="disk-bar"
                  style={{
                    width: disk.percent,
                    backgroundColor: getUsageColor(disk.percent),
                  }}
                />
              </div>
              <div className="disk-stats">
                <span className="disk-used">{disk.used} / {disk.size}</span>
                <span
                  className="disk-percent"
                  style={{ color: getUsageColor(disk.percent) }}
                >
                  {disk.percent}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
