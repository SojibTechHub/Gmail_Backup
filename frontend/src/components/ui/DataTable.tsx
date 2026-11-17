'use client';

import React from 'react';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import clsx from 'clsx';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items matching your criteria.',
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300 p-6 rounded-2xl">
        <TableSkeleton rows={5} cols={columns.length} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div
      className={clsx(
        'overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-sm',
        className
      )}
    >
      <table className="table table-zebra w-full text-left">
        <thead className="bg-base-200/60 text-xs font-semibold text-base-content/70 uppercase tracking-wider">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={clsx('py-3 px-4', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-base-200 text-sm">
          {data.map((row, rowIndex) => {
            const key = row._id || row.id || rowIndex;
            return (
              <tr
                key={key}
                onClick={() => onRowClick && onRowClick(row)}
                className={clsx(
                  'hover:bg-base-200/40 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, colIndex) => {
                  let content: React.ReactNode;
                  if (typeof col.accessor === 'function') {
                    content = col.accessor(row);
                  } else if (col.accessor) {
                    content = String(row[col.accessor] ?? '');
                  } else {
                    content = null;
                  }

                  return (
                    <td key={colIndex} className={clsx('py-3.5 px-4', col.className)}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
