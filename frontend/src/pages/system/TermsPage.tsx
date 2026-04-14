import { Link, useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-white">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--accent-amber)]/10 dark:bg-white/10 blur-[180px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12">
        <header className="mb-12 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/assets/brand/logo-dark-512.png" alt="Eagle-Foundry" className="h-16 w-16 rounded-full" />
            <span className="text-base font-semibold tracking-wide text-[var(--foreground)]">Eagle-Foundry</span>
          </Link>
        </header>

        <div className="ef-card rounded-2xl border border-white/10 bg-[var(--elements)] p-8 backdrop-blur-lg md:p-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBBF24]/10 dark:bg-white/5">
            <Scale size={24} className="text-[var(--foreground)]" />
          </div>
          <h1 className="ef-heading-gradient text-3xl font-semibold md:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Last updated: February 2025</p>

          <div className="mt-10 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Acceptance of Terms</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                By accessing or using Eagle-Foundry, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Use of the Platform</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                You agree to use Eagle-Foundry only for lawful purposes. You may not misuse the platform, harass other users, post false information, or violate any applicable laws or regulations.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">User Accounts</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                You are responsible for maintaining the confidentiality of your account and password. You are responsible for all activities that occur under your account.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Intellectual Property</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Content you create on the platform remains yours. By posting content, you grant Eagle-Foundry a license to display and share it as necessary to operate the platform.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 border-t border-black/10 dark:border-white/10 pt-8">
            <Button withBorderEffect={false} onClick={() => navigate('/privacy')}>
              Privacy Policy
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
