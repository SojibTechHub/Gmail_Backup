'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AdminDashboardStats, EmailProvider } from '../../types';
import { getProviderColor, getProviderName } from '../../utils/helpers';

export function ProviderStats({ stats }: { stats?: AdminDashboardStats | null }) {
  const distribution = stats?.providerDistribution || {};

  const chartData = Object.entries(distribution).map(([provider, count]) => ({
    provider: provider as EmailProvider,
    name: getProviderName(provider as EmailProvider),
    count: Number(count),
    color: getProviderColor(provider as EmailProvider),
  }));

  const sortedData = chartData.sort((a, b) => b.count - a.count);

  return (
    <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm space-y-4">
      <div>
        <h3 className="text-base font-bold text-base-content">
          Email Provider Distribution
        </h3>
        <p className="text-xs text-base-content/60 mt-0.5">
          Breakdown of registered email accounts across third-party platforms
        </p>
      </div>

      <div className="h-64 w-full">
        {sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-base-content/50">
            No provider account data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
