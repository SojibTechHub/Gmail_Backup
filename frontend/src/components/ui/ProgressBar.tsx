'use client';

import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  colorScheme?: 'auto' | 'primary' | 'success' | 'warning' | 'error';
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  className,
  colorScheme = 'auto',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const getColorClass = () => {
    if (colorScheme !== 'auto') {
      return {
        primary: 'progress-primary',
        success: 'progress-success',
        warning: 'progress-warning',
        error: 'progress-error',
      }[colorScheme];
    }
    if (percentage >= 75) return 'progress-success';
    if (percentage >= 50) return 'progress-warning';
    return 'progress-error';
  };

  const sizeClass = {
    xs: 'h-1.5',
    sm: 'h-2',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
          {label && <span className="text-base-content/80">{label}</span>}
          {showPercent && <span className="text-base-content/90 font-semibold">{percentage}%</span>}
        </div>
      )}
      <progress
        className={clsx('progress w-full', getColorClass(), sizeClass)}
        value={percentage}
        max="100"
      />
    </div>
  );
}
