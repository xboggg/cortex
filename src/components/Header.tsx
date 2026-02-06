import { Brain, RefreshCw, Settings, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  serverName?: string;
}

export function Header({ onRefresh, serverName = 'Server' }: HeaderProps) {
  const netdataUrl = import.meta.env.VITE_NETDATA_URL || 'http://localhost:19999';

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Brain size={28} className="logo-icon" />
          <span className="logo-text">Cortex</span>
        </div>
        <span className="server-name">{serverName}</span>
      </div>

      <div className="header-right">
        <a
          href={netdataUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="header-btn"
          title="Open Netdata Dashboard"
        >
          <ExternalLink size={18} />
          <span>Netdata</span>
        </a>
        {onRefresh && (
          <button onClick={onRefresh} className="header-btn" title="Refresh">
            <RefreshCw size={18} />
          </button>
        )}
        <button className="header-btn" title="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
