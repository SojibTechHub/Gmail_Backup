'use client';

import React, { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  variant?: 'bordered' | 'ghost' | 'primary' | 'secondary' | 'accent';
  className?: string;
  containerClassName?: string;
}

const variantClasses: Record<NonNullable<InputProps['variant']>, string> = {
  bordered: 'input-bordered',
  ghost: 'input-ghost',
  primary: 'input-primary',
  secondary: 'input-secondary',
  accent: 'input-accent',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      variant = 'bordered',
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx('form-control w-full', containerClassName)}>
        {label && (
          <label className="label" htmlFor={inputId}>
            <span className="label-text font-medium">{label}</span>
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon className="h-4 w-4 text-base-content/50" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'input w-full',
              variantClasses[variant],
              error && 'input-error',
              Icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
