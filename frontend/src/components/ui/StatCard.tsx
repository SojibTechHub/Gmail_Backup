'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  color = 'primary',
  description,
  className,
}: StatCardProps) {
  const colorMap = {
    primary: {
      bg: 'bg-primary/10 text-primary border-primary/20',
      badge: 'text-primary',
    },
    success: {
      bg: 'bg-success/10 text-success border-success/20',
      badge: 'text-success',
    },
    warning: {
      bg: 'bg-warning/10 text-warning border-warning/20',
      badge: 'text-warning',
    },
    error: {
      bg: 'bg-error/10 text-error border-error/20',
      badge: 'text-error',
    },
    info: {
      bg: 'bg-info/10 text-info border-info/20',
      badge: 'text-info',
    },
  }[color];

  return (
    <div
      className={clsx(
        'card bg-base-100 border border-base-300/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 rounded-2xl',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/60">{title}</p>
          <h4 className="text-2xl font-bold mt-1 text-base-content tracking-tight">{value}</h4>
        </div>
        <div className={clsx('p-3 rounded-2xl border', colorMap.bg)}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>
      {(change || description) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={clsx(
                'font-medium',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-error',
                trend === 'neutral' && 'text-base-content/60'
              )}
            >
              {change}
            </span>
          )}
          {description && <span className="text-base-content/60">{description}</span>}
        </div>
      )}
    </div>
  );
}
