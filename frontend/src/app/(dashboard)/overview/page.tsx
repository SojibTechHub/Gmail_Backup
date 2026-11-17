'use client';

import React, { useEffect, useState } from 'react';
import accountService from '../../../services/account.service';
import { UserDashboardStats } from '../../../types';
import { WelcomeCard } from '../../../components/dashboard/WelcomeCard';
import { StatsGrid } from '../../../components/dashboard/StatsGrid';
import { ReadinessChart } from '../../../components/dashboard/ReadinessChart';
import { RecentActivities } from '../../../components/dashboard/RecentActivities';
import { QuickActions } from '../../../components/dashboard/QuickActions';
import { SecurityAlerts } from '../../../components/dashboard/SecurityAlerts';
import { SecurityHealthCard } from '../../../components/dashboard/SecurityHealthCard';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function OverviewPage() {
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    accountService
      .getDashboardStats()
      .then((data) => {
        if (isMounted) setStats(data || null);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <WelcomeCard />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}

      <QuickActions />

      <SecurityHealthCard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          {loading ? (
            <Skeleton className="h-96 rounded-3xl" />
          ) : (
            <ReadinessChart stats={stats} />
          )}
        </div>
        <div className="lg:col-span-7">
          {loading ? (
            <Skeleton className="h-96 rounded-3xl" />
          ) : (
            <RecentActivities activities={stats?.recentActivities} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1">
        <SecurityAlerts />
      </div>
    </div>
  );
}
