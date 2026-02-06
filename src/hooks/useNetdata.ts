import { useState, useEffect, useCallback } from 'react';
import { netdata } from '../lib/netdata';
import type { NetdataInfo, SystemMetrics, Container, Alarm } from '../types/netdata';

export function useNetdataInfo() {
  const [info, setInfo] = useState<NetdataInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    netdata
      .getInfo()
      .then(setInfo)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { info, loading, error };
}

export function useSystemMetrics(refreshInterval = 2000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await netdata.getSystemMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { metrics, loading, error, refresh };
}

export function useContainers(refreshInterval = 5000) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await netdata.getContainers();
      setContainers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch containers'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { containers, loading, error, refresh };
}

export function useAlarms(refreshInterval = 10000) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await netdata.getAlarms();
      setAlarms(Object.values(data.alarms));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch alarms'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { alarms, loading, error, refresh };
}

export function useChartData(chart: string, after = -300, refreshInterval = 2000) {
  const [data, setData] = useState<{ labels: string[]; data: number[][] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      const chartData = await netdata.getChartData(chart, after, 0, 60);
      setData(chartData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch chart data'));
    } finally {
      setLoading(false);
    }
  }, [chart, after]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh };
}
