'use client';

import { useState, useEffect, useCallback } from 'react';
import accountService from '../services/account.service';
import { IEmailAccount } from '../types';

export function useAccounts(initialFilter?: {
  search?: string;
  provider?: string;
  readiness?: string;
}) {
  const [accounts, setAccounts] = useState<IEmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await accountService.getAccounts(initialFilter);
      setAccounts(data.accounts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  }, [initialFilter?.search, initialFilter?.provider, initialFilter?.readiness]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { accounts, isLoading, error, refetch: fetchAccounts };
}
