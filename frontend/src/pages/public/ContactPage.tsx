import { type KeyboardEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Building2, GraduationCap, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import SectionShell from '@/components/public/SectionShell';
import useCardSpotlight from '@/components/public/useCardSpotlight';

export default function ContactPage(): JSX.Element {
  const { rootRef, handlePointerMove } = useCardSpotlight();

  const [formState, setFormState] = useState({
    name: '', email: '', subject: '', message: '', type: '',
  });
  const [submitted, setSubmitted] = useState(false);

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

  const selectReason = (title: string) => {
    setFormState((s) => ({ ...s, type: title }));
  };

  const handleReasonKeyDown = (event: KeyboardEvent<HTMLButtonElement>, title: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectReason(title);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-[var(--border)] bg-black/[0.04] dark:bg-white/5 px-4 py-3 text-sm text-[var(--foreground)] placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-colors focus:border-black/20 dark:focus:border-white/25';

  return (
    <main ref={rootRef} onPointerMove={handlePointerMove} className="relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.14]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-30rem] mx-auto h-[52rem] w-[52rem] rounded-full bg-black/5 dark:bg-white/10 blur-[220px]" />
      <div className="pointer-events-none absolute left-[-20rem] top-[30rem] h-[35rem] w-[35rem] rounded-full bg-blue-500/15 blur-[180px]" />

      <div className="relative z-10">
        <PublicNavbar />

        {/* Hero */}
        <SectionShell className="pb-8 -mt-40 md:pt-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-7"
          >
            <span className="mb-6 inline-block rounded-full border border-[var(--border)] bg-black/[0.04] dark:bg-white/5 px-4 py-1.5 text-xs text-[var(--muted)]">
              Contact
            </span>
            <h1 className="ef-heading-gradient mb-5 text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Let's talk.
            </h1>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Whether you're a student with a question, a company looking to partner, or a university
              wanting to integrate — we'd love to hear from you.
            </p>
          </motion.div>
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-black/[0.04] dark:bg-white/5">
                    <Mail size={16} className="text-[var(--muted)]" />
                  </div>
                  <div>
                    <div className="mb-0.5 text-sm font-medium text-[var(--foreground)]">Email us</div>
                    <a href="mailto:hello@eagle-foundry.com" className="text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
                      hello@eagle-foundry.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-black/[0.04] dark:bg-white/5">
                    <MessageSquare size={16} className="text-[var(--muted)]" />
                  </div>
                  <div>
                    <div className="mb-0.5 text-sm font-medium text-[var(--foreground)]">Response time</div>
                    <p className="text-xs text-[var(--muted)]">We typically reply within 1–2 business days.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-[var(--border)] bg-black/[0.04] dark:bg-white/5 p-6">
                <div className="mb-3 text-sm font-semibold text-[var(--foreground)]">Already have an account?</div>
                <p className="mb-4 text-xs text-[var(--muted)]">
                  Reach our support team directly from inside the platform for faster responses.
                </p>
                <Link to="/login" className="text-xs text-[var(--muted)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)]">
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
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-black/[0.04] dark:bg-white/5">
                    <Send size={22} className="text-[var(--foreground)]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">Email client opened</h3>
                  <p className="text-sm text-[var(--muted)]">Your email client has been opened. Please complete sending in your email app.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-xs text-[var(--muted)]">Name</label>
                      <input
                        id="contact-name"
                        className={inputClass}
                        placeholder="Your name"
                        value={formState.name}
                        onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-xs text-[var(--muted)]">Email</label>
                      <input
                        id="contact-email"
                        className={inputClass}
                        type="email"
                        placeholder="you@example.com"
                        value={formState.email}
                        onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="mb-1.5 block text-xs text-[var(--muted)]">Subject</label>
                    <input
                      id="contact-subject"
                      className={inputClass}
                      placeholder="How can we help?"
                      value={formState.subject}
                      onChange={(e) => setFormState((s) => ({ ...s, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-xs text-[var(--muted)]">Message</label>
                    <textarea
                      id="contact-message"
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
