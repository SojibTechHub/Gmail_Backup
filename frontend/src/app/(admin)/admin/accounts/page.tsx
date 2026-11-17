'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database, RefreshCw, X, Shield } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../../../services/admin.service';
import { IEmailAccount, EmailProvider } from '../../../../types';
import { ProviderIcon } from '../../../../components/accounts/ProviderIcon';
import {
  getReadinessBadge,
  getOwnershipBadge,
  getProviderName,
  timeAgo,
} from '../../../../utils/helpers';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Button } from '../../../../components/ui/Button';

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<IEmailAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAccounts({
        search: search || undefined,
        provider: provider || undefined,
      });
      setAccounts(data.accounts);
    } catch (err: unknown) {
      toast.error('Failed to load global accounts');
    } finally {
      setLoading(false);
    }
  }, [search, provider]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const columns: Column<IEmailAccount>[] = [
    {
      header: 'Account / Provider',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <ProviderIcon provider={row.provider} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-xs text-base-content truncate">{row.email}</p>
            <p className="text-[10px] text-base-content/50">{getProviderName(row.provider)}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner User',
      accessor: (row) => {
        const user = row.userId as unknown as { name?: string; email?: string } | undefined;
        return (
          <div>
            <p className="text-xs font-medium text-base-content">{user?.name || 'User'}</p>
            <p className="text-[10px] text-base-content/60">{user?.email || ''}</p>
          </div>
        );
      },
    },
    {
      header: 'Readiness',
      accessor: (row) => {
        const badge = getReadinessBadge(row.recoveryReadiness);
        return <span className={`badge badge-sm font-semibold ${badge.className}`}>{badge.label}</span>;
      },
    },
    {
      header: 'Ownership',
      accessor: (row) => {
        const badge = getOwnershipBadge(row.ownershipStatus);
        return <span className={`badge badge-sm ${badge.className}`}>{badge.label}</span>;
      },
    },
    {
      header: 'Configured Safeties',
      accessor: (row) => {
        const items = [
          row.hasRecoveryEmail && 'Email',
          row.hasRecoveryPhone && 'Phone',
          row.has2FA && '2FA',
          row.hasBackupCodes && 'Backup',
        ].filter(Boolean);
        return (
          <span className="text-xs text-base-content/70">
            {items.length > 0 ? items.join(', ') : 'None'}
          </span>
        );
      },
    },
    {
      header: 'Last Updated',
      accessor: (row) => (
        <span className="text-xs text-base-content/60">{timeAgo(row.lastUpdated)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          Global Protected Accounts
        </h1>
        <p className="text-xs text-base-content/60 mt-0.5">
          System-wide directory of registered email addresses and recovery statuses
        </p>
      </div>

      {/* Zero-Knowledge Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-base-100 border border-base-300 flex items-center gap-2.5 text-xs text-base-content/80">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <span>
          <strong>Zero-Knowledge Rule:</strong> Administrators can monitor account counts and readiness scores, but private AES-256 vault credentials remain encrypted and unreadable.
        </span>
      </div>

      {/* Filter Bar */}
      <div className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search accounts by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered input-sm rounded-xl text-xs flex-1 max-w-sm"
        />

        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="select select-bordered select-sm rounded-xl text-xs w-48"
        >
          <option value="">All Providers</option>
          <option value={EmailProvider.GMAIL}>Gmail</option>
          <option value={EmailProvider.OUTLOOK}>Outlook</option>
          <option value={EmailProvider.YAHOO}>Yahoo</option>
          <option value={EmailProvider.ICLOUD}>iCloud</option>
          <option value={EmailProvider.ZOHO}>Zoho</option>
          <option value={EmailProvider.PROTONMAIL}>Proton</option>
          <option value={EmailProvider.GMX}>GMX</option>
          <option value={EmailProvider.AOL}>AOL</option>
          <option value={EmailProvider.YANDEX}>Yandex</option>
          <option value={EmailProvider.CUSTOM}>Custom</option>
        </select>

        {(search || provider) && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setProvider('');
            }}
            className="btn btn-ghost btn-sm text-xs text-error gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={accounts}
        loading={loading}
        emptyTitle="No accounts found"
        emptyDescription="No registered accounts match your current criteria."
      />
    </div>
  );
}
