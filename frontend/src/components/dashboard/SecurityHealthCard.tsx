'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import accountService from '../../services/account.service';
import { Button } from '../ui/Button';

interface SecurityHealthData {
  overallHealthScore: number;
  grade: string;
  totalAccounts: number;
  staleAccountsCount: number;
  vulnerableAccountsCount: number;
  actionItems: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    accountId: string | null;
    email: string;
  }>;
}

export function SecurityHealthCard() {
  const [data, setData] = useState<SecurityHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    accountService
      .getSecurityHealth()
      .then((res) => setData(res || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return <div className="h-48 skeleton rounded-3xl" />;
  }

  if (!data) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-success bg-success/10 border-success/30';
      case 'B':
        return 'text-primary bg-primary/10 border-primary/30';
      case 'C':
        return 'text-warning bg-warning/10 border-warning/30';
      default:
        return 'text-error bg-error/10 border-error/30';
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl border ${getGradeColor(
              data.grade
            )}`}
          >
            {data.grade}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-base-content">
                Security Health Monitor
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Live Scan
              </span>
            </div>
            <p className="text-xs text-base-content/60 mt-0.5">
              Automated audit of recovery readiness and credential hygiene
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          className="btn btn-ghost btn-xs text-base-content/60 hover:text-base-content self-end sm:self-auto gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Scan Again
        </button>
      </div>

      {/* Progress & Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-base-200/50 border border-base-300">
        <div>
          <span className="text-[11px] font-bold uppercase text-base-content/50">Overall Readiness</span>
          <p className="text-xl font-black text-base-content mt-0.5">{data.overallHealthScore}%</p>
          <div className="w-full bg-base-300 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${
                data.overallHealthScore >= 80
                  ? 'bg-success'
                  : data.overallHealthScore >= 50
                  ? 'bg-warning'
                  : 'bg-error'
              }`}
              style={{ width: `${data.overallHealthScore}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-base-content/50">Stale Credentials</span>
          <p className="text-xl font-black text-warning mt-0.5">{data.staleAccountsCount}</p>
          <p className="text-[10px] text-base-content/50 mt-1">Unchecked for &gt; 180 days</p>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-base-content/50">At-Risk Accounts</span>
          <p className="text-xl font-black text-error mt-0.5">{data.vulnerableAccountsCount}</p>
          <p className="text-[10px] text-base-content/50 mt-1">Missing 2FA / Backup Codes</p>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/70">
          Prioritized Action Items ({data.actionItems.length})
        </h4>

        {data.actionItems.length === 0 ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-success/10 border border-success/20 text-xs text-success">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>All monitored accounts meet full recovery and 2FA readiness standards. Great job!</span>
          </div>
        ) : (
          <div className="space-y-2">
            {data.actionItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-base-300 bg-base-100 hover:border-primary/40 transition-colors gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {item.severity === 'critical' ? (
                      <ShieldAlert className="w-4 h-4 text-error" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-warning" />
                    ) : (
                      <Clock className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-base-content truncate">{item.title}</p>
                    <p className="text-[11px] text-base-content/60 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.accountId ? (
                  <Link href={`/vault?account=${item.accountId}`}>
                    <Button variant="ghost" size="xs" className="shrink-0 border border-base-300">
                      Fix in Vault <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/accounts/add">
                    <Button variant="primary" size="xs" className="shrink-0">
                      Add Email
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
