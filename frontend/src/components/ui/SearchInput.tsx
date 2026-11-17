'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export function SearchInput({ value, onChange, onClear, className, placeholder = 'Search...', ...props }: SearchInputProps) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={clsx(
          'input input-bordered input-sm w-full pl-9 pr-8 bg-base-200/50 focus:bg-base-100 transition-colors',
          className
        )}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-base-content"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
