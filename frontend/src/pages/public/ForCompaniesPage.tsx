import { type PointerEvent, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Search, Zap, DollarSign, ClipboardList, ShieldCheck, BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function SectionShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`mx-auto w-full max-w-6xl px-6 py-20 md:px-10 ${className}`}>
      {children}
    </section>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const navLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Students', href: '/for-students' },
    { label: 'For Companies', href: '/for-companies' },
    { label: 'Funding', href: '/funding' },
    { label: 'Contact', href: '/contact' },
  ];
  return (
    <header className="flex items-center justify-between gap-4 px-6 pt-8 md:px-10">
      <Link to="/" className="inline-flex items-center gap-3">
        <picture>
          <source media="(prefers-color-scheme: light)" srcSet="/assets/brand/logo-light-512.png" />
          <img src="/assets/brand/logo-dark-512.png" alt="Eagle-Foundry" className="h-8 w-8 rounded-full object-cover" />
        </picture>
        <span className="text-sm font-semibold tracking-wide text-zinc-100">Eagle-Foundry</span>
      </Link>
      <nav className="hidden items-center gap-7 text-xs text-zinc-300 md:flex">
        {navLinks.map((item) => (
          <Link key={item.href} to={item.href} className="transition-colors hover:text-white">{item.label}</Link>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="hidden md:inline-flex" onClick={() => navigate('/login')}>Sign In</Button>
        <Button withBorderEffect={false} className="gap-2" onClick={() => navigate('/sign-up')}>
          Get Started <ArrowRight size={14} />
        </Button>
      </div>
    </header>
  );
}

const useCases = [
  {
    icon: Search,
    title: 'Discover founder-ready talent',
    description: 'Browse vetted student profiles filtered by skill, university, and domain. Find people who already think like founders.',
  },
  {
    icon: ClipboardList,
    title: 'Outsource strategic work',
    description: 'Post scoped projects — market research, product prototypes, GTM analysis — and receive submissions from high-calibre student teams.',
  },
  {
    icon: Zap,
    title: 'Hire before anyone else',
    description: "Publish internships and roles to an audience that isn't on LinkedIn. Get applicants who have already shipped something.",
  },
  {
    icon: DollarSign,
    title: 'Invest at the earliest stage',
    description: 'Access a live deal flow of student ventures reviewed by university admins. Back the ones that fit your thesis before they raise.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified & admin-approved',
    description: "Every student startup is reviewed before being listed. You're never sifting through noise — only curated, serious projects.",
  },
  {
    icon: BarChart2,
    title: 'Track your pipeline',
    description: 'Manage applications, project submissions, and investment conversations from a single company dashboard.',
  },
];

const tiers = [
  {
    name: 'Explorer',
    price: 'Free',
    description: 'Get started and browse the network.',
    features: ['Company profile listing', 'Browse student startups', 'Post 1 opportunity/month', 'Basic applicant tracking'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    name: 'Partner',
    price: '€299/mo',
    description: 'For companies actively hiring and investing.',
    features: ['Unlimited opportunities', 'Outsource project board', 'Priority applicant ranking', 'Direct messaging', 'Startup deal flow access'],
    cta: 'Start as Partner',
    highlight: true,
  },
  {
    name: 'Venture',
    price: 'Custom',
    description: 'For VCs and corporates running structured programs.',
    features: ['All Partner features', 'Branded investment program', 'Cohort management', 'Dedicated account manager', 'API access'],
    cta: 'Contact us',
    highlight: false,
  },
];

export default function ForCompaniesPage(): JSX.Element {
  const rootRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLElement[] | null>(null);
  const navigate = useNavigate();

  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!cardsRef.current && rootRef.current) {
      cardsRef.current = Array.from(rootRef.current.querySelectorAll<HTMLElement>('.ef-card'));
    }
    (cardsRef.current ?? []).forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', `${event.clientX - rect.left}`);
      card.style.setProperty('--y', `${event.clientY - rect.top}`);
    });
  }, []);

  return (
    <main ref={rootRef} onPointerMove={handlePointerMove} className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-30rem] mx-auto h-[52rem] w-[52rem] rounded-full bg-white/10 blur-[220px]" />
      <div className="pointer-events-none absolute right-[-24rem] top-[20rem] h-[35rem] w-[35rem] rounded-full bg-blue-500/20 blur-[180px]" />

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <SectionShell className="pb-8 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-2xl"
          >
            <span className="mb-6 inline-block rounded-full border border-zinc-500/30 bg-zinc-500/10 px-4 py-1.5 text-xs text-zinc-300">
              For Companies
            </span>
            <h1 className="ef-heading-gradient mb-5 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              The pipeline you've been missing.
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-zinc-400 md:text-base">
              Eagle-Foundry connects your company to the best student talent and earliest-stage ventures —
              before they hit the open market.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button withBorderEffect={false} className="gap-2 px-6" onClick={() => navigate('/sign-up')}>
                Register your company <ArrowRight size={14} />
              </Button>
              <Button variant="ghost" onClick={() => navigate('/contact')}>Talk to our team</Button>
            </div>
          </motion.div>
        </SectionShell>

        <div className="mx-auto max-w-6xl px-6 md:px-10"><hr className="muted-divider" /></div>

        {/* Use cases */}
        <SectionShell>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <h2 className="ef-heading-gradient mb-4 text-3xl font-semibold tracking-tight">What companies do on Eagle-Foundry</h2>
            <p className="max-w-lg text-sm text-zinc-400">Whether you're hiring, outsourcing, or investing — the platform adapts to your goals.</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="ef-card glass-card rounded-2xl p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <item.icon size={18} className="text-zinc-300" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-zinc-100">{item.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        <div className="mx-auto max-w-6xl px-6 md:px-10"><hr className="muted-divider" /></div>

        {/* Pricing tiers */}
        <SectionShell>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 text-center"
          >
            <h2 className="ef-heading-gradient mb-4 text-3xl font-semibold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-sm text-zinc-400">Start for free. Scale as you grow.</p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`ef-card rounded-2xl p-7 ${tier.highlight ? 'glass-card border border-white/20' : 'glass-card'}`}
              >
                {tier.highlight && (
                  <div className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-medium text-zinc-200">
                    Most popular
                  </div>
                )}
                <div className="mb-1 text-sm font-semibold text-zinc-200">{tier.name}</div>
                <div className="mb-2 text-3xl font-bold text-white">{tier.price}</div>
                <p className="mb-6 text-xs text-zinc-400">{tier.description}</p>
                <ul className="mb-8 space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="h-1 w-1 rounded-full bg-zinc-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  withBorderEffect={false}
                  variant={tier.highlight ? undefined : 'ghost'}
                  className="w-full justify-center gap-2"
                  onClick={() => navigate(tier.price === 'Custom' ? '/contact' : '/sign-up')}
                >
                  {tier.cta} <ArrowRight size={13} />
                </Button>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        {/* CTA */}
        <SectionShell className="pt-4 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="ef-heading-gradient mb-4 text-4xl font-semibold">Ready to find your next hire?</h2>
            <p className="mb-8 text-sm text-zinc-400">Join 120+ companies already using Eagle-Foundry.</p>
            <Button withBorderEffect={false} className="gap-2 px-8" onClick={() => navigate('/sign-up')}>
              Register your company <ArrowRight size={14} />
            </Button>
          </motion.div>
        </SectionShell>
      </div>
    </main>
  );
}
