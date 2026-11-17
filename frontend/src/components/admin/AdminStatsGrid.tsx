'use client';

import React from 'react';
import { Users, UserCheck, Mail, ShieldAlert } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { AdminDashboardStats } from '../../types';

export function AdminStatsGrid({ stats }: { stats?: AdminDashboardStats | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Platform Users"
        value={stats?.totalUsers ?? 0}
        icon={Users}
        color="primary"
        description="Registered user accounts"
      />
      <StatCard
        title="Active Users (30d)"
        value={stats?.activeUsers ?? 0}
        icon={UserCheck}
        color="success"
        description="Active in last 30 days"
      />
      <StatCard
        title="Protected Email Accounts"
        value={stats?.totalAccounts ?? 0}
        icon={Mail}
        color="info"
        description="Registered email addresses"
      />
      <StatCard
        title="Total Recovery Sessions"
        value={stats?.totalRecoverySessions ?? 0}
        icon={ShieldAlert}
        color="warning"
        description="Guided recovery attempts"
      />
    </div>
  );
}
