#!/usr/bin/env python3
"""
Cortex Backend API
Provides Docker containers, systemd services, and cron job data.
Runs on port 3500.
"""

import subprocess
import json
import re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os

# CORS headers for cross-origin requests
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

# Services to monitor - Customized for Contabo server
MONITORED_SERVICES = [
    # Core services
    'nginx',
    'mysql',
    'redis-server',
    'postgresql',
    'docker',
    'netdata',
    'ssh',
    'cron',

    # TrendiMovies Telegram services
    'trendimovies-tg-api',          # Telegram file streaming API (port 8765)

    # Project-specific services
    'cortex-api',                    # This monitoring API

    # Supabase services (if running)
    # 'supabase-kong',
    # 'supabase-rest',
]

# Cron files/patterns to specifically highlight
IMPORTANT_CRON_PATTERNS = [
    'trendimovies',
    'telegram',
    'ddl',
    'docker-cleanup',
    'backup',
]


def run_command(cmd: list) -> tuple:
    """Run a shell command and return stdout, stderr, returncode."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return '', 'Command timed out', 1
    except Exception as e:
        return '', str(e), 1


def get_docker_containers() -> list:
    """Get list of all Docker containers with their status."""
    containers = []

    stdout, stderr, code = run_command([
        'docker', 'ps', '-a',
        '--format', '{{.ID}}\t{{.Names}}\t{{.Status}}\t{{.State}}\t{{.Image}}\t{{.Ports}}\t{{.CreatedAt}}'
    ])

    if code != 0:
        return []

    for line in stdout.strip().split('\n'):
        if not line:
            continue
        parts = line.split('\t')
        if len(parts) >= 7:
            containers.append({
                'id': parts[0],
                'name': parts[1],
                'status': parts[2],
                'state': parts[3],
                'image': parts[4],
                'ports': parts[5],
                'created': parts[6],
            })

    return containers


def get_systemd_services() -> list:
    """Get status of monitored systemd services."""
    services = []

    for service_name in MONITORED_SERVICES:
        stdout, stderr, code = run_command([
            'systemctl', 'show', service_name,
            '--property=ActiveState,SubState,Description,MainPID'
        ])

        if code != 0:
            continue

        props = {}
        for line in stdout.strip().split('\n'):
            if '=' in line:
                key, value = line.split('=', 1)
                props[key] = value

        if props.get('ActiveState'):
            services.append({
                'name': service_name,
                'description': props.get('Description', ''),
                'status': props.get('ActiveState', 'unknown'),
                'subState': props.get('SubState', 'unknown'),
                'pid': int(props.get('MainPID', 0)) or None,
            })

    return services


def get_cron_jobs() -> list:
    """Get system cron jobs from /etc/cron.d and /var/spool/cron."""
    jobs = []

    # Parse /etc/cron.d
    cron_d_path = '/etc/cron.d'
    if os.path.isdir(cron_d_path):
        for filename in os.listdir(cron_d_path):
            if filename.startswith('.'):
                continue
            filepath = os.path.join(cron_d_path, filename)
            if os.path.isfile(filepath):
                try:
                    with open(filepath, 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#'):
                                # Parse cron line
                                match = re.match(
                                    r'^([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+(\S+)\s+(.+)$',
                                    line
                                )
                                if match:
                                    schedule = ' '.join(match.groups()[:5])
                                    user = match.group(6)
                                    command = match.group(7)

                                    # Get a name from the command
                                    cmd_parts = command.split()
                                    name = os.path.basename(cmd_parts[0]) if cmd_parts else filename

                                    jobs.append({
                                        'name': f"{filename}: {name}",
                                        'schedule': schedule,
                                        'command': command[:100] + '...' if len(command) > 100 else command,
                                        'lastRun': None,
                                        'lastStatus': 'unknown',
                                        'lastDuration': None,
                                        'nextRun': None,
                                    })
                except Exception:
                    continue

    # Parse root's crontab
    stdout, stderr, code = run_command(['crontab', '-l'])
    if code == 0:
        for line in stdout.strip().split('\n'):
            line = line.strip()
            if line and not line.startswith('#'):
                match = re.match(
                    r'^([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+([\d\*\/\-\,]+)\s+(.+)$',
                    line
                )
                if match:
                    schedule = ' '.join(match.groups()[:5])
                    command = match.group(6)

                    cmd_parts = command.split()
                    name = os.path.basename(cmd_parts[0]) if cmd_parts else 'crontab'

                    jobs.append({
                        'name': f"root: {name}",
                        'schedule': schedule,
                        'command': command[:100] + '...' if len(command) > 100 else command,
                        'lastRun': None,
                        'lastStatus': 'unknown',
                        'lastDuration': None,
                        'nextRun': None,
                    })

    return jobs


def get_disk_usage() -> list:
    """Get disk usage for mounted filesystems."""
    disks = []

    stdout, stderr, code = run_command(['df', '-h', '--output=source,size,used,avail,pcent,target'])
    if code != 0:
        return []

    lines = stdout.strip().split('\n')[1:]  # Skip header
    for line in lines:
        parts = line.split()
        if len(parts) >= 6 and not parts[0].startswith('tmpfs'):
            disks.append({
                'filesystem': parts[0],
                'size': parts[1],
                'used': parts[2],
                'available': parts[3],
                'percent': parts[4],
                'mountpoint': parts[5],
            })

    return disks


class CortexHandler(BaseHTTPRequestHandler):
    """HTTP request handler for Cortex API."""

    def send_json(self, data: any, status: int = 200):
        """Send JSON response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(204)
        for key, value in CORS_HEADERS.items():
            self.send_header(key, value)
        self.end_headers()

    def do_GET(self):
        """Handle GET requests."""
        parsed = urlparse(self.path)
        path = parsed.path

        routes = {
            '/api/containers': get_docker_containers,
            '/api/services': get_systemd_services,
            '/api/crons': get_cron_jobs,
            '/api/disks': get_disk_usage,
            '/api/health': lambda: {'status': 'ok'},
        }

        if path in routes:
            try:
                data = routes[path]()
                self.send_json(data)
            except Exception as e:
                self.send_json({'error': str(e)}, 500)
        else:
            self.send_json({'error': 'Not found'}, 404)

    def log_message(self, format, *args):
        """Suppress default logging."""
        pass


def main():
    """Start the API server."""
    port = int(os.environ.get('CORTEX_PORT', 3500))
    server = HTTPServer(('0.0.0.0', port), CortexHandler)
    print(f'Cortex API running on port {port}')
    server.serve_forever()


if __name__ == '__main__':
    main()
