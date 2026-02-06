import { Header } from './components/Header';
import { SystemOverview } from './components/SystemOverview';
import { CPUChart } from './components/CPUChart';
import { MemoryChart } from './components/MemoryChart';
import { NetworkChart } from './components/NetworkChart';
import { ContainersList } from './components/ContainersList';
import { ServicesList } from './components/ServicesList';
import { CronJobs } from './components/CronJobs';
import { DiskUsage } from './components/DiskUsage';
import { AlertsPanel } from './components/AlertsPanel';
import './App.css';

function App() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} serverName="Contabo VPS" />

      <main className="main">
        <div className="dashboard-grid">
          {/* Row 1: System Overview + Alerts */}
          <div className="grid-item span-2">
            <SystemOverview />
          </div>
          <div className="grid-item">
            <AlertsPanel />
          </div>

          {/* Row 2: Charts */}
          <div className="grid-item">
            <CPUChart />
          </div>
          <div className="grid-item">
            <MemoryChart />
          </div>
          <div className="grid-item">
            <NetworkChart />
          </div>

          {/* Row 3: Containers, Services, Disk */}
          <div className="grid-item">
            <ContainersList />
          </div>
          <div className="grid-item">
            <ServicesList />
          </div>
          <div className="grid-item">
            <DiskUsage />
          </div>

          {/* Row 4: Cron Jobs */}
          <div className="grid-item span-full">
            <CronJobs />
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>Cortex Server Monitor</span>
        <span className="footer-dot">•</span>
        <span>Powered by Netdata</span>
      </footer>
    </div>
  );
}

export default App;
