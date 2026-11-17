'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UserDashboardStats } from '../../types';

export function ReadinessChart({ stats }: { stats?: UserDashboardStats | null }) {
  const ready = stats?.recoveryReady ?? 0;
  const partial = stats?.partiallyReady ?? 0;
  const missing = stats?.missingInfo ?? 0;

  const total = ready + partial + missing;

  const data = [
    { name: 'Recovery Ready', value: ready, color: '#10b981' }, // emerald
    { name: 'Partially Ready', value: partial, color: '#f59e0b' }, // amber
    { name: 'Missing Info', value: missing, color: '#ef4444' }, // red
  ].filter((item) => item.value > 0);

  // If no data, show a neutral placeholder slice
  const chartData = data.length > 0 ? data : [{ name: 'No Accounts', value: 1, color: '#64748b' }];

  return (
    <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-base-content">Recovery Readiness Distribution</h3>
        <p className="text-xs text-base-content/60 mt-0.5">
          Global security posture across registered email addresses
        </p>
      </div>

      <div className="h-52 w-full my-4 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-base-content">
            {total > 0 ? `${Math.round((ready / total) * 100)}%` : '0%'}
          </span>
          <span className="text-[10px] text-base-content/60 uppercase font-bold tracking-wider">
            Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-base-200 text-center">
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-success font-medium">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>Ready</span>
          </div>
          <span className="text-lg font-bold text-base-content">{ready}</span>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-warning font-medium">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span>Partial</span>
          </div>
          <span className="text-lg font-bold text-base-content">{partial}</span>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-error font-medium">
            <span className="w-2 h-2 rounded-full bg-error" />
            <span>Missing</span>
          </div>
          <span className="text-lg font-bold text-base-content">{missing}</span>
        </div>
      </div>
    </div>
  );
}
