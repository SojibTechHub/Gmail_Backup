'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import accountService from '../../../services/account.service';
import { IEmailAccount } from '../../../types';
import { AccountCard } from '../../../components/accounts/AccountCard';
import { AccountFilters } from '../../../components/accounts/AccountFilters';
import { AccountForm } from '../../../components/accounts/AccountForm';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<IEmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');
  const [readiness, setReadiness] = useState('');

  // Edit Modal State
  const [editingAccount, setEditingAccount] = useState<IEmailAccount | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountService.getAccounts({
        search: search || undefined,
        provider: provider || undefined,
        readiness: readiness || undefined,
      });
      setAccounts(data.accounts);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch email accounts');
    } finally {
      setLoading(false);
    }
  }, [search, provider, readiness]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a._id !== id));
      toast.success('Email account removed successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingAccount) return;
    setUpdateLoading(true);
    try {
      const updated = await accountService.updateAccount(editingAccount._id, formData);
      if (updated) {
        setAccounts((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
      }
      setEditingAccount(null);
      toast.success('Account updated successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            Email Accounts Management
          </h1>
          <p className="text-xs text-base-content/60 mt-1">
            Monitor and manage recovery information across all your registered email accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAccounts}
            leftIcon={RefreshCw}
            className="text-base-content/70"
          >
            Refresh
          </Button>
          <Link href="/accounts/add">
            <Button variant="primary" size="sm" leftIcon={Plus} className="font-semibold shadow-md">
              Add Email Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <AccountFilters
        search={search}
        onSearchChange={setSearch}
        provider={provider}
        onProviderChange={setProvider}
        readiness={readiness}
        onReadinessChange={setReadiness}
        onReset={() => {
          setSearch('');
          setProvider('');
          setReadiness('');
        }}
      />

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No email accounts found"
          description={
            search || provider || readiness
              ? 'No accounts match your current filter parameters.'
              : 'Add your first email account to start tracking recovery readiness.'
          }
          actionLabel="Add Email Account"
          onAction={() => (window.location.href = '/accounts/add')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <AccountCard
              key={acc._id}
              account={acc}
              onDelete={handleDelete}
              onEdit={(account) => setEditingAccount(account)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        open={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        title="Edit Email Account"
        maxWidth="lg"
      >
        {editingAccount && (
          <div className="pt-2">
            <AccountForm
              initialData={editingAccount}
              onSubmit={handleUpdate}
              loading={updateLoading}
              onCancel={() => setEditingAccount(null)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
