'use client';

import { useState, useEffect, useCallback } from 'react';
import recoveryService from '../services/recovery.service';
import { IRecoverySession } from '../types';

export function useRecovery(params?: { accountId?: string; status?: string }) {
  const [sessions, setSessions] = useState<IRecoverySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recoveryService.getSessions(params);
      setSessions(data.sessions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recovery sessions');
    } finally {
      setIsLoading(false);
    }
  }, [params?.accountId, params?.status]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, error, refetch: fetchSessions };
}
