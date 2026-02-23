import { cn } from '@/lib/cn';

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps): JSX.Element {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
            active === tab
              ? 'border-white/30 bg-white/10 text-white'
              : 'border-white/12 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
