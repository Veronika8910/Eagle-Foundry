import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { navItems } from '@/features/landing/data/content';
import { SectionShell } from '@/features/landing/components/section-shell';
import { useTheme } from '@/hooks/useTheme';

export function PublicNavbar(): JSX.Element {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  return (
    <div className="relative overflow-hidden">
      <SectionShell className="pt-8 md:pt-10">
        <header className="mb-16 flex items-center justify-between gap-4">

          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src={isDark ? '/assets/brand/logo-dark-512.png' : '/assets/brand/logo-light-512.png'}
              alt="Eagle-Foundry"
              className="h-16 w-16 rounded-full object-cover"
            />
            <span className="text-base font-semibold tracking-wide text-[var(--foreground)]">
              Eagle-Foundry
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] md:flex">
            {navItems.map((item) => (
              <Link
                key={item}
                to={(() => {
                  const slug = item.toLowerCase().replace(/\s+/g, '-');
                  return slug === 'contact' ? '/contact' : `/${slug}`;
                })()}
                className="transition-colors hover:text-[var(--foreground)]"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className={[
                'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors',
                isDark
                  ? 'border-white/10 bg-white/5 text-zinc-400 hover:border-[var(--accent-amber)] hover:text-[var(--accent-amber)]'
                  : 'border-black/10 bg-black/5 text-zinc-500 hover:border-[#4D3B92] hover:text-[#4D3B92]',
              ].join(' ')}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button withBorderEffect={false} className="gap-2" onClick={() => navigate('/sign-up')}>
              Get Started
              <ArrowRight size={14} />
            </Button>
          </div>
        </header>
      </SectionShell>
    </div>
  );
}
