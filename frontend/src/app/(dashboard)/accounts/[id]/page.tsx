'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Shield,
  Lock,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import accountService from '../../../../services/account.service';
import recoveryService from '../../../../services/recovery.service';
import { IEmailAccount, ReadinessReportData } from '../../../../types';
import { ProviderIcon } from '../../../../components/accounts/ProviderIcon';
import {
  getReadinessBadge,
  getOwnershipBadge,
  getProviderName,
  formatDate,
} from '../../../../utils/helpers';
import { Button } from '../../../../components/ui/Button';
import { ProgressBar } from '../../../../components/ui/ProgressBar';
import { Skeleton } from '../../../../components/ui/Skeleton';

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const accountId = resolvedParams.id;
  const router = useRouter();

  const [account, setAccount] = useState<IEmailAccount | null>(null);
  const [readinessReport, setReadinessReport] = useState<ReadinessReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      accountService.getAccountById(accountId),
      recoveryService.getReadiness(accountId).catch(() => null),
    ])
      .then(([acc, report]) => {
        if (isMounted) {
          setAccount(acc || null);
          setReadinessReport(report);
        }
      })
      .catch((err) => {
        toast.error('Failed to load account details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [accountId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Account Not Found</h2>
        <Link href="/accounts" className="btn btn-ghost btn-sm mt-4">
          &larr; Return to Accounts
        </Link>
      </div>
    );
  }

  const readiness = getReadinessBadge(account.recoveryReadiness);
  const ownership = getOwnershipBadge(account.ownershipStatus);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/accounts"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ProviderIcon provider={account.provider} size="lg" />
            <div>
              <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
                {account.label || account.email}
              </h1>
              <p className="text-xs text-base-content/60">{account.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/vault?account=${account._id}`}>
              <Button variant="ghost" size="sm" leftIcon={Lock} className="border border-base-300">
                Encrypted Vault
              </Button>
            </Link>
            <Link href={`/recovery?account=${account._id}`}>
              <Button variant="primary" size="sm" leftIcon={Play} className="font-semibold shadow-md">
                Launch Recovery
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Account Card */}
      <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-base-200">
          <div>
            <span className="text-xs text-base-content/50 uppercase font-semibold">Provider</span>
            <p className="text-sm font-bold text-base-content mt-1">
              {getProviderName(account.provider)}
            </p>
          </div>
          <div>
            <span className="text-xs text-base-content/50 uppercase font-semibold">Ownership</span>
            <div className="mt-1">
              <span className={`badge badge-sm ${ownership.className}`}>{ownership.label}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-base-content/50 uppercase font-semibold">Status</span>
            <div className="mt-1">
              <span className={`badge badge-sm ${readiness.className}`}>{readiness.label}</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-base-content/50 uppercase font-semibold">Last Verified</span>
            <p className="text-xs text-base-content mt-1">{formatDate(account.lastUpdated)}</p>
          </div>
        </div>

        {/* Recovery Score */}
        {readinessReport && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-base-content">
                Recovery Readiness Health Score
              </h3>
              <span className="text-sm font-extrabold text-primary">
                {readinessReport.score} / 100
              </span>
            </div>
            <ProgressBar value={readinessReport.score} size="md" />
          </div>
        )}

        {/* Recovery Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
            Recovery Safeguards
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 flex items-center justify-between">
              <span className="text-xs font-medium">Secondary Recovery Email</span>
              {account.hasRecoveryEmail ? (
                <span className="badge badge-success badge-sm text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="badge badge-error badge-sm text-white gap-1">
                  <XCircle className="w-3 h-3" /> Missing
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 flex items-center justify-between">
              <span className="text-xs font-medium">Recovery Phone Number (SMS)</span>
              {account.hasRecoveryPhone ? (
                <span className="badge badge-success badge-sm text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="badge badge-error badge-sm text-white gap-1">
                  <XCircle className="w-3 h-3" /> Missing
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 flex items-center justify-between">
              <span className="text-xs font-medium">Two-Factor Authenticator (TOTP)</span>
              {account.has2FA ? (
                <span className="badge badge-success badge-sm text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="badge badge-error badge-sm text-white gap-1">
                  <XCircle className="w-3 h-3" /> Missing
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 flex items-center justify-between">
              <span className="text-xs font-medium">One-Time Emergency Backup Codes</span>
              {account.hasBackupCodes ? (
                <span className="badge badge-success badge-sm text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="badge badge-error badge-sm text-white gap-1">
                  <XCircle className="w-3 h-3" /> Missing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {readinessReport && readinessReport.recommendations.length > 0 && (
          <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20">
            <h4 className="text-xs font-bold text-warning uppercase tracking-wider mb-2">
              Actionable Recommendations
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-base-content/80">
              {readinessReport.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {account.notes && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-base-content/60 uppercase">Notes</h4>
            <p className="text-xs text-base-content/80 mt-1 p-3 rounded-xl bg-base-200/40 border border-base-300/50">
              {account.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
