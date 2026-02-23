import { cn } from '@/lib/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function MetricCard({ label, value, className }: MetricCardProps): JSX.Element {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-black/40 p-4', className)}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
