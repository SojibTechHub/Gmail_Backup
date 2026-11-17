'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { EmailProvider } from '../../types';
import { getProviderColor, getProviderName } from '../../utils/helpers';

interface ProviderIconProps {
  provider: EmailProvider;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export function ProviderIcon({
  provider,
  size = 'md',
  showName = false,
  className,
}: ProviderIconProps) {
  const color = getProviderColor(provider);
  const name = getProviderName(provider);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base font-bold',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className || ''}`}>
      <div
        className={`rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${sizeClasses}`}
        style={{ backgroundColor: color }}
      >
        <Mail className={iconSizes} />
      </div>
      {showName && (
        <span className="font-semibold text-sm text-base-content">{name}</span>
      )}
    </div>
  );
}
