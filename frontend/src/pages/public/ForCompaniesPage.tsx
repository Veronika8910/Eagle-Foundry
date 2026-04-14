import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Search, Zap, DollarSign, ClipboardList, ShieldCheck, BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import SectionShell from '@/components/public/SectionShell';
import useCardSpotlight from '@/components/public/useCardSpotlight';

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

export default function ForCompaniesPage(): JSX.Element {
  const { rootRef, handlePointerMove } = useCardSpotlight();
  const navigate = useNavigate();

  return (
    <main ref={rootRef} onPointerMove={handlePointerMove} className="relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-30rem] mx-auto h-[52rem] w-[52rem] rounded-full bg-black/5 dark:bg-white/10 blur-[220px]" />
      <div className="pointer-events-none absolute right-[-24rem] top-[20rem] h-[35rem] w-[35rem] rounded-full bg-blue-500/20 blur-[180px]" />

      <div className="relative z-10">
        <PublicNavbar />

        {/* Hero */}
        <SectionShell className="pb-8 -mt-40 md:pt-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-2xl"
          >
            <span className="mb-6 inline-block rounded-full border border-[#C38E06]/40 dark:border-[#FBBF24]/30 bg-[#C9A447]/10 dark:bg-[#FBBF24]/10 text-[#C38E06] dark:text-[#FBBF24] px-4 py-1.5 text-xs">
              For Companies
            </span>
            <h1 className="ef-heading-gradient mb-5 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              The pipeline you've been missing.
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Eagle-Foundry connects your company to the best student talent and earliest-stage ventures —
              before they hit the open market.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button withBorderEffect={false} className="gap-2 px-6" onClick={() => navigate('/sign-up/company')}>
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
            <p className="max-w-lg text-sm text-[var(--muted)]">Whether you're hiring, outsourcing, or investing — the platform adapts to your goals.</p>
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
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-black/[0.04] dark:bg-white/5">
                  <item.icon size={18} className="text-[var(--muted)]" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="text-xs leading-relaxed text-[var(--muted)]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        <div className="mx-auto max-w-6xl px-6 md:px-10"><hr className="muted-divider" /></div>

        {/* CTA */}
        <SectionShell className="pt-4 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="ef-heading-gradient mb-4 text-4xl font-semibold">Ready to find your next hire?</h2>
            <p className="mb-8 text-sm text-[var(--muted)]">Join 120+ companies already using Eagle-Foundry.</p>
            <Button withBorderEffect={false} className="gap-2 px-8" onClick={() => navigate('/sign-up/company')}>
              Register your company <ArrowRight size={14} />
            </Button>
          </motion.div>
        </SectionShell>
      </div>
    </main>
  );
}
