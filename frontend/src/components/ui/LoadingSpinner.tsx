'use client';

import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClass = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  }[size];

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2', className)}>
      <span className={clsx('loading loading-spinner text-primary', sizeClass)} />
      {label && <span className="text-xs text-base-content/70">{label}</span>}
    </div>
  );
}
