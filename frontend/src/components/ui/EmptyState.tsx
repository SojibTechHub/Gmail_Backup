'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-base-300 bg-base-100/50 ${className || ''}`}
    >
      <div className="p-4 rounded-2xl bg-base-200/80 text-primary mb-4 shadow-inner">
        <Icon className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-base-content mb-1">{title}</h3>
      <p className="text-sm text-base-content/70 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
