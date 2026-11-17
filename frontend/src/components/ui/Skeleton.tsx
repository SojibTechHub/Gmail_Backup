'use client';

import React from 'react';
import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  count?: number;
}

export function Skeleton({ className, variant = 'rectangular', count = 1 }: SkeletonProps) {
  const elements = Array.from({ length: count });

  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'h-4 w-full rounded';
      case 'card':
        return 'h-32 w-full rounded-xl';
      case 'rectangular':
      default:
        return 'rounded-lg';
    }
  };

  return (
    <>
      {elements.map((_, i) => (
        <div
          key={i}
          className={clsx(
            'skeleton bg-base-300/60 animate-pulse',
            getVariantClass(),
            className
          )}
        />
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
