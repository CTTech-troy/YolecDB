/**
 * Reusable Table component with pagination
 */

import { ReactNode } from 'react';
import { Button } from './Button';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string } | { uid: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
        <i className="ri-inbox-line mb-2 text-4xl opacity-60" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ width: column.width }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const rowKey = 'id' in item ? item.id : item.uid;
            return (
              <tr key={rowKey}>
                {columns.map((column) => (
                  <td key={column.key} className="min-w-0">
                    {column.render
                      ? column.render(item)
                      : (item as Record<string, ReactNode>)[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <p className="text-center text-sm text-slate-600 sm:text-left dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          icon="ri-arrow-left-s-line"
        >
          Previous
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          Next
          <i className="ri-arrow-right-s-line" />
        </Button>
      </div>
    </div>
  );
}
