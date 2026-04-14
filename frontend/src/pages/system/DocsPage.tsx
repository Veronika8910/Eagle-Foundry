import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocsPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--accent-amber)]/10 dark:bg-white/10 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12">
        <header className="mb-12 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/assets/brand/logo-dark-512.png" alt="Eagle-Foundry" className="h-16 w-16 rounded-full" />
            <span className="text-base font-semibold tracking-wide text-[var(--foreground)]">Eagle-Foundry</span>
          </Link>
        </header>

        <div className="ef-card rounded-2xl border border-[var(--border)] bg-[var(--elements)] p-8 backdrop-blur-lg md:p-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBBF24]/10 dark:bg-[var(--elements)]">
            <FileText size={24} className="text-[var(--foreground)]" />
          </div>
          <h1 className="ef-heading-gradient text-3xl font-semibold md:text-4xl">Documentation</h1>
          <p className="mt-3 text-[var(--muted)]">
            Welcome to Eagle-Foundry documentation. Here you&apos;ll find guides and references for students, companies, and university admins.
          </p>

          <div className="mt-10 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">For Students</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Learn how to create and manage your startup profile, apply to opportunities, and collaborate with companies. Explore the student dashboard and portfolio features.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">For Companies</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Post opportunities, review applications, and manage your organization. Find out how to discover and work with student founders on the platform.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">For University Admins</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Moderate startups, manage users, and maintain platform quality. Access admin workflows for reviews, reports, and audit logs.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 border-t border-[var(--border)] pt-8">
            <Button withBorderEffect={false} onClick={() => navigate('/sign-up')}>
              Get Started
            </Button>
            <Button variant="ghost" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
