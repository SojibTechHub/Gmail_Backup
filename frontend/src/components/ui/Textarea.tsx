'use client';

import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, containerClassName, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={clsx('form-control w-full', containerClassName)}>
        {label && (
          <label className="label" htmlFor={textareaId}>
            <span className="label-text font-medium">{label}</span>
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'textarea textarea-bordered w-full',
            error && 'textarea-error',
            className
          )}
          {...props}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
