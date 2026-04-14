import { Inbox } from 'lucide-react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title = 'Nothing here yet', description, action, className }: EmptyStateProps): JSX.Element {
  return (
    <div className={cn('flex flex-col items-center py-16 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 dark:bg-black/5">
        <Inbox size={24} className="text-[var(--muted)]" />
      </div>
      <h3 className="text-base font-medium text-[var(--foreground)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
