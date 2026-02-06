# Cortex

Lightweight server monitoring dashboard powered by Netdata.

## Features

- **Real-time System Metrics** - CPU, memory, disk, network
- **Docker Container Monitoring** - Status, resource usage
- **Systemd Service Status** - Track critical services
- **Cron Job Tracking** - See all scheduled tasks
- **Beautiful Dark UI** - Modern, responsive design

## Architecture

```
┌─────────────────────────────────────────────┐
│               Cortex Dashboard              │
│           (React/Vite SPA - :8080)          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐       ┌─────────────────┐  │
│  │  Netdata    │       │  Cortex API     │  │
│  │  (:19999)   │       │  (:3500)        │  │
│  │             │       │                 │  │
│  │ - CPU       │       │ - Containers    │  │
│  │ - Memory    │       │ - Services      │  │
│  │ - Disk      │       │ - Cron Jobs     │  │
│  │ - Network   │       │ - Disk Usage    │  │
│  └─────────────┘       └─────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- Python 3.8+
- Netdata (installed via kickstart script)
- Nginx

## Installation

### 1. Clone the repository

```bash
git clone git@github.com:xboggg/cortex.git /var/www/cortex
cd /var/www/cortex
```

### 2. Install Netdata (if not already installed)

```bash
wget -O /tmp/netdata-kickstart.sh https://get.netdata.cloud/kickstart.sh
bash /tmp/netdata-kickstart.sh --dont-wait
```

### 3. Deploy Cortex

```bash
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment

### Frontend

```bash
npm install
npm run build
```

### Backend API

```bash
# Install service
cp server/cortex-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable cortex-api
systemctl start cortex-api
```

### Nginx Configuration

The deploy script creates `/etc/nginx/sites-available/cortex`. Key points:
- Dashboard served from `/var/www/cortex/dist`
- API proxied from `/api/` to `:3500`
- Netdata proxied from `/netdata/` to `:19999`

## Access

After deployment:
- **Dashboard:** http://SERVER_IP:8080
- **Netdata:** http://SERVER_IP:19999
- **API:** http://SERVER_IP:3500

## Configuration

Copy `.env.example` to `.env` and adjust:

```bash
VITE_NETDATA_URL=http://localhost:19999
VITE_API_URL=http://localhost:3500
```

## Monitored Services

Edit `server/api.py` to customize which services are monitored:

```python
MONITORED_SERVICES = [
    'nginx',
    'mysql',
    'redis-server',
    'postgresql',
    'docker',
    'netdata',
    'ssh',
    'cron',
]
```

## Development

```bash
# Start frontend dev server
npm run dev

# Run backend API
python3 server/api.py
```

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Recharts
- **Backend:** Python (simple HTTP server)
- **Metrics:** Netdata
- **Styling:** CSS Variables, Dark Theme

## License

MIT
