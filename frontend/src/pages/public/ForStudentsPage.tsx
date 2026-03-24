import { type PointerEvent, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Rocket, Users, Trophy, Briefcase, Star, GitMerge, Globe, MessageSquare,
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

const features = [
  {
    icon: Rocket,
    title: 'Launch your startup',
    description: 'Submit your venture idea and get it reviewed by university admins. Approved projects get listed and gain instant visibility.',
  },
  {
    icon: Users,
    title: 'Find co-founders',
    description: 'Post team openings and browse talent across universities. Find the technical, business, or creative co-founder you need.',
  },
  {
    icon: Briefcase,
    title: 'Apply for opportunities',
    description: 'Access exclusive internships and strategic roles from companies actively looking for founder-minded students.',
  },
  {
    icon: Trophy,
    title: 'Build your portfolio',
    description: "Every project, application, and role gets tracked. Your Eagle-Foundry portfolio is proof of what you've shipped.",
  },
  {
    icon: Globe,
    title: 'Get discovered',
    description: 'Companies and investors browse student profiles. A strong profile means inbound opportunities without cold outreach.',
  },
  {
    icon: MessageSquare,
    title: 'Collaborate in-platform',
    description: 'Message co-founders, talk to company contacts, and manage your team — all inside Eagle-Foundry.',
  },
];

const stats = [
  { value: '2,400+', label: 'Student founders' },
  { value: '380+', label: 'Active startups' },
  { value: '$4.2M', label: 'Raised on platform' },
  { value: '120+', label: 'Partner companies' },
];

export default function ForStudentsPage(): JSX.Element {
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
      <div className="pointer-events-none absolute left-[-20rem] top-[30rem] h-[35rem] w-[35rem] rounded-full bg-blue-500/15 blur-[180px]" />

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <SectionShell className="pb-8 pt-16">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mb-6 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs text-blue-300">
                For Students
              </span>
              <h1 className="ef-heading-gradient mb-5 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
                Your venture starts here.
              </h1>
              <p className="mb-8 max-w-lg text-sm leading-relaxed text-zinc-400 md:text-base">
                Eagle-Foundry gives ambitious students the network, tools, and capital access to turn ideas
                into real companies — without waiting to graduate.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button withBorderEffect={false} className="gap-2 px-6" onClick={() => navigate('/sign-up')}>
                  Join as a student <ArrowRight size={14} />
                </Button>
                <Button variant="ghost" onClick={() => navigate('/how-it-works')}>See how it works</Button>
              </div>
            </motion.div>

            {/* Stats panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  className="ef-card glass-card rounded-2xl p-6"
                >
                  <div className="mb-1 text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </SectionShell>

        <div className="mx-auto max-w-6xl px-6 md:px-10"><hr className="muted-divider" /></div>

        {/* Features */}
        <SectionShell>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12"
          >
            <h2 className="ef-heading-gradient mb-4 text-3xl font-semibold tracking-tight">Everything you need to build</h2>
            <p className="max-w-lg text-sm text-zinc-400">
              From your first idea to your first funding round, Eagle-Foundry has the tools to support every stage.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
                className="ef-card glass-card rounded-2xl p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <feature.icon size={18} className="text-zinc-300" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-zinc-100">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        <div className="mx-auto max-w-6xl px-6 md:px-10"><hr className="muted-divider" /></div>

        {/* Testimonial-style highlight */}
        <SectionShell>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass-card rounded-3xl p-10 md:p-14"
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-16">
              <div className="flex-1">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-zinc-300 text-zinc-300" />
                  ))}
                </div>
                <blockquote className="mb-6 text-lg font-medium leading-relaxed text-zinc-100 md:text-xl">
                  "We found our CTO, raised our first €50K, and signed our first company partnership — all through Eagle-Foundry in under 4 months."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full border border-white/10 bg-zinc-700" />
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">Maria Santos</div>
                    <div className="text-xs text-zinc-400">Co-founder, VerdeAI · University of Porto</div>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
                  <GitMerge size={20} className="text-zinc-300" />
                  <div>
                    <div className="text-xs text-zinc-400">Startups launched</div>
                    <div className="text-2xl font-bold text-white">380+</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </SectionShell>

        {/* CTA */}
        <SectionShell className="pt-4 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="ef-heading-gradient mb-4 text-4xl font-semibold">Start building today.</h2>
            <p className="mb-8 text-sm text-zinc-400">Free to join. No approval needed to create your profile.</p>
            <Button withBorderEffect={false} className="gap-2 px-8 py-3" onClick={() => navigate('/sign-up')}>
              Create your student profile <ArrowRight size={14} />
            </Button>
          </motion.div>
        </SectionShell>
      </div>
    </main>
  );
}
