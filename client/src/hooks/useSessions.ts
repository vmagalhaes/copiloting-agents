import { useState, useEffect, useCallback } from 'react';
import { fetchSessions, type SessionSummary } from '../api/client.ts';
import { getCachedSessions, setCachedSessions } from '../api/cache.ts';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>(() => getCachedSessions() ?? []);
  const [loading, setLoading] = useState(() => getCachedSessions() === null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchSessions();
      setCachedSessions(data);
      setSessions(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return { sessions, loading, error, refetch: load };
}
