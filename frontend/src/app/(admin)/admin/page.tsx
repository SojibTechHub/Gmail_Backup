'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Database,
  FileText,
  Sliders,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../../services/admin.service';
import { AdminDashboardStats, IAuditLog } from '../../../types';
import { AdminStatsGrid } from '../../../components/admin/AdminStatsGrid';
import { ProviderStats } from '../../../components/admin/ProviderStats';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDate, timeAgo } from '../../../utils/helpers';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStatistics();
      setStats(data || null);
    } catch (err: unknown) {
      toast.error('Failed to load administrative analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-warning font-bold text-[10px] tracking-wider uppercase">
              Admin Privilege Mode
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            Security &amp; System Administration
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Platform governance, user accounts, audit trails, and provider infrastructure
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchStats}
          leftIcon={RefreshCw}
          className="border border-base-300"
        >
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <AdminStatsGrid stats={stats} />
      )}

      {/* Fast Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/users"
          className="p-4 rounded-2xl bg-base-100 border border-base-300 hover:border-primary/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-base-content group-hover:text-primary transition-colors">
                User Directory
              </h4>
              <p className="text-xs text-base-content/60">Manage roles and authorizations</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary" />
        </Link>

        <Link
          href="/admin/accounts"
          className="p-4 rounded-2xl bg-base-100 border border-base-300 hover:border-primary/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-info/10 text-info">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-base-content group-hover:text-info transition-colors">
                Global Accounts
              </h4>
              <p className="text-xs text-base-content/60">View all registered email accounts</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-info" />
        </Link>

        <Link
          href="/admin/audit-logs"
          className="p-4 rounded-2xl bg-base-100 border border-base-300 hover:border-primary/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10 text-warning">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-base-content group-hover:text-warning transition-colors">
                Audit Trail
              </h4>
              <p className="text-xs text-base-content/60">Forensic immutable security logs</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-warning" />
        </Link>
      </div>

      {/* Provider Distribution Chart */}
      <ProviderStats stats={stats} />

      {/* Recent Audit Logs Preview */}
      <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-base-content">Recent Platform Audit Events</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Live security and governance actions across the system
            </p>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            Full Audit Log &rarr;
          </Link>
        </div>

        <div className="divide-y divide-base-200">
          {(stats?.recentAuditLogs || []).map((log) => {
            const user = log.userId as { name?: string; email?: string } | undefined;
            return (
              <div
                key={log._id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-semibold text-base-content">
                    {user?.name || user?.email || 'System'}
                  </span>
                  <span className="badge badge-sm badge-neutral ml-2 font-mono text-[10px]">
                    {log.action}
                  </span>
                  <p className="text-base-content/60 mt-0.5">{log.details || log.resource}</p>
                </div>
                <div className="text-right text-[11px] text-base-content/50">
                  <p>{timeAgo(log.createdAt)}</p>
                  <p className="font-mono">{log.ipAddress}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
