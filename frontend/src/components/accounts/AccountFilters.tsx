'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { EmailProvider, RecoveryReadiness } from '../../types';
import { SearchInput } from '../ui/SearchInput';

interface AccountFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  provider: string;
  onProviderChange: (value: string) => void;
  readiness: string;
  onReadinessChange: (value: string) => void;
  onReset: () => void;
}

export function AccountFilters({
  search,
  onSearchChange,
  provider,
  onProviderChange,
  readiness,
  onReadinessChange,
  onReset,
}: AccountFiltersProps) {
  const hasActiveFilters = !!search || !!provider || !!readiness;

  return (
    <div className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="sm:col-span-5">
          <SearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={() => onSearchChange('')}
            placeholder="Search by email or label..."
          />
        </div>

        {/* Provider Select */}
        <div className="sm:col-span-3">
          <select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="select select-bordered select-sm w-full text-xs rounded-xl"
          >
            <option value="">All Providers</option>
            <option value={EmailProvider.GMAIL}>Gmail</option>
            <option value={EmailProvider.OUTLOOK}>Outlook</option>
            <option value={EmailProvider.YAHOO}>Yahoo</option>
            <option value={EmailProvider.ICLOUD}>iCloud</option>
            <option value={EmailProvider.ZOHO}>Zoho</option>
            <option value={EmailProvider.PROTONMAIL}>Proton</option>
            <option value={EmailProvider.GMX}>GMX</option>
            <option value={EmailProvider.AOL}>AOL</option>
            <option value={EmailProvider.YANDEX}>Yandex</option>
            <option value={EmailProvider.CUSTOM}>Custom</option>
          </select>
        </div>

        {/* Readiness Select */}
        <div className="sm:col-span-3">
          <select
            value={readiness}
            onChange={(e) => onReadinessChange(e.target.value)}
            className="select select-bordered select-sm w-full text-xs rounded-xl"
          >
            <option value="">All Readiness Statuses</option>
            <option value={RecoveryReadiness.READY}>Recovery Ready</option>
            <option value={RecoveryReadiness.PARTIALLY_READY}>Partially Ready</option>
            <option value={RecoveryReadiness.MISSING_INFO}>Missing Info</option>
            <option value={RecoveryReadiness.SETUP_RECOMMENDED}>Setup Recommended</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="sm:col-span-1 flex justify-end">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="btn btn-ghost btn-sm btn-circle text-error"
              title="Reset Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
