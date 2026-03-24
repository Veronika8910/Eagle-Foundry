import { type PointerEvent, useCallback, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, MessageSquare, Building2, GraduationCap, Send } from 'lucide-react';
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

const reasons = [
  { icon: GraduationCap, title: "I'm a student", description: 'Questions about joining, launching a project, or getting funded.' },
  { icon: Building2, title: "I'm a company", description: 'Partnership enquiries, pricing, or getting your organisation verified.' },
  { icon: MessageSquare, title: 'General enquiry', description: 'Press, universities, or anything else.' },
];

export default function ContactPage(): JSX.Element {
  const rootRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLElement[] | null>(null);

  const [formState, setFormState] = useState({
    name: '', email: '', subject: '', message: '', type: '',
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = () => {
    const { name, email, subject, message, type } = formState;
    const body = [
      type && `Type: ${type}`,
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].filter(Boolean).join('\n');

    window.open(
      `mailto:hello@eagle-foundry.com?subject=${encodeURIComponent(subject || 'Contact from Eagle-Foundry')}&body=${encodeURIComponent(body)}`,
      '_blank',
    );
    setSubmitted(true);
  };

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-white/25 focus:bg-white/8';

  return (
    <main ref={rootRef} onPointerMove={handlePointerMove} className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-30rem] mx-auto h-[52rem] w-[52rem] rounded-full bg-white/10 blur-[220px]" />
      <div className="pointer-events-none absolute left-[-20rem] top-[30rem] h-[35rem] w-[35rem] rounded-full bg-blue-500/15 blur-[180px]" />

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <SectionShell className="pb-8 pt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-xl"
          >
            <span className="mb-6 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300">
              Contact
            </span>
            <h1 className="ef-heading-gradient mb-5 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Let's talk.
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              Whether you're a student with a question, a company looking to partner, or a university
              wanting to integrate — we'd love to hear from you.
            </p>
          </motion.div>
        </SectionShell>

        {/* Reason cards */}
        <SectionShell className="pt-4 pb-10">
          <div className="grid gap-4 md:grid-cols-3">
            {reasons.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                onClick={() => setFormState((s) => ({ ...s, type: reason.title }))}
                className={`ef-card glass-card cursor-pointer rounded-2xl p-6 transition-colors ${formState.type === reason.title ? 'border-white/25' : ''}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <reason.icon size={18} className="text-zinc-300" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-100">{reason.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-400">{reason.description}</p>
              </motion.div>
            ))}
          </div>
        </SectionShell>

        <div className="mx-auto max-w-6xl px-6 md:px-10"><hr className="muted-divider" /></div>

        {/* Form + info */}
        <SectionShell>
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
            {/* Left info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="ef-heading-gradient mb-6 text-2xl font-semibold">Get in touch</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Mail size={16} className="text-zinc-300" />
                  </div>
                  <div>
                    <div className="mb-0.5 text-sm font-medium text-zinc-200">Email us</div>
                    <a href="mailto:hello@eagle-foundry.com" className="text-xs text-zinc-400 transition-colors hover:text-zinc-200">
                      hello@eagle-foundry.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <MessageSquare size={16} className="text-zinc-300" />
                  </div>
                  <div>
                    <div className="mb-0.5 text-sm font-medium text-zinc-200">Response time</div>
                    <p className="text-xs text-zinc-400">We typically reply within 1–2 business days.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 text-sm font-semibold text-zinc-200">Already have an account?</div>
                <p className="mb-4 text-xs text-zinc-400">
                  Reach our support team directly from inside the platform for faster responses.
                </p>
                <Link to="/login" className="text-xs text-zinc-300 underline underline-offset-4 transition-colors hover:text-white">
                  Sign in to get help →
                </Link>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="ef-card glass-card rounded-2xl p-8"
            >
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Send size={22} className="text-zinc-200" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-100">Message sent!</h3>
                  <p className="text-sm text-zinc-400">We'll get back to you within 1–2 business days.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs text-zinc-400">Name</label>
                      <input
                        className={inputClass}
                        placeholder="Your name"
                        value={formState.name}
                        onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs text-zinc-400">Email</label>
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="you@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-zinc-400">Subject</label>
                    <input
                      className={inputClass}
                      placeholder="How can we help?"
                      value={formState.subject}
                      onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-zinc-400">Message</label>
                    <textarea
                      className={`${inputClass} h-36 resize-none`}
                      placeholder="Tell us more..."
                      value={formState.message}
                      onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                    />
                  </div>
                  <Button
                    withBorderEffect={false}
                    className="w-full justify-center gap-2"
                    onClick={handleSubmit}
                    disabled={!formState.name || !formState.email || !formState.message}
                  >
                    Send message <Send size={13} />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </SectionShell>
      </div>
    </main>
  );
}
