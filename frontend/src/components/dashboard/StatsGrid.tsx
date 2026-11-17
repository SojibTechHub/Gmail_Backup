'use client';

import React from 'react';
import { Mail, CheckCircle, AlertTriangle, ShieldX } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { UserDashboardStats } from '../../types';

export function StatsGrid({ stats }: { stats?: UserDashboardStats | null }) {
  const total = stats?.totalAccounts ?? 0;
  const ready = stats?.recoveryReady ?? 0;
  const partial = stats?.partiallyReady ?? 0;
  const missing = stats?.missingInfo ?? 0;

  const readyPercent = total > 0 ? Math.round((ready / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Accounts"
        value={total}
        icon={Mail}
        color="primary"
        description="Registered in MailVault"
      />
      <StatCard
        title="Recovery Ready"
        value={ready}
        icon={CheckCircle}
        color="success"
        change={`${readyPercent}%`}
        trend="up"
        description="Full recovery readiness"
      />
      <StatCard
        title="Partially Ready"
        value={partial}
        icon={AlertTriangle}
        color="warning"
        description="Minor recovery items missing"
      />
      <StatCard
        title="Missing Info"
        value={missing}
        icon={ShieldX}
        color="error"
        description="Setup recommended urgently"
      />
    </div>
  );
}
