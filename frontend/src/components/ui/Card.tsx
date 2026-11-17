'use client';

import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({
  header,
  footer,
  children,
  className,
  bodyClassName,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'card rounded-xl bg-base-100 shadow transition-shadow duration-200 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-base-200 px-6 py-4">{header}</div>
      )}
      <div className={clsx('card-body', bodyClassName)}>{children}</div>
      {footer && (
        <div className="border-t border-base-200 px-6 py-4">{footer}</div>
      )}
    </div>
  );
}
