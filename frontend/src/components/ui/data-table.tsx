import { cn } from '@/lib/cn';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
  className?: string;
}

function getSortIcon(col: Column<unknown>, sortKey?: string, sortDir?: 'asc' | 'desc') {
  if (!col.sortable) return null;
  if (sortKey === col.key) {
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-[var(--foreground)]" />  
      : <ArrowDown size={12} className="text-[var(--foreground)]" />;
  }
  return <ArrowUpDown size={12} className="text-[var(--muted)]" />;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  sortKey,
  sortDir,
  onSort,
  emptyMessage = 'No data found',
  className,
}: DataTableProps<T>): JSX.Element {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--elements)]', className)}>
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-[var(--border)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn('px-4 py-3 font-medium', col.sortable && 'cursor-pointer select-none', col.className)}
                onClick={() => col.sortable && onSort?.(col.key)}
                onKeyDown={(e) => {
                  if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSort?.(col.key);
                  }
                }}
                tabIndex={col.sortable ? 0 : undefined}
                role={col.sortable ? 'button' : undefined}
                aria-sort={
                  col.sortable && sortKey === col.key
                    ? (sortDir === 'asc' ? 'ascending' : 'descending')
                    : col.sortable ? 'none' : undefined
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  {col.header}
                  {getSortIcon(col as Column<unknown>, sortKey, sortDir)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--muted)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={typeof row.id === 'string' || typeof row.id === 'number' ? `id:${String(row.id)}` : `idx:${String(i)}`}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
                className={cn(
                  'border-b border-[var(--border)] text-[var(--foreground)] last:border-b-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.03] focus-visible:bg-black/[0.03] dark:focus-visible:bg-white/[0.03] focus-visible:outline-none',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3', col.className)}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
