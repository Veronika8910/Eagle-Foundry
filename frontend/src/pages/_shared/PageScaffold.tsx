import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEfCardPointer } from '@/hooks/useEfCardPointer';
import type { PageConfig, PageLink } from '@/pages/_shared/types';

interface Props {
  config: PageConfig;
}

interface ActionButtonProps {
  label: string;
  to?: string;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
  withBorderEffect?: boolean;
}

function ActionButton({ label, to, variant = 'ghost', className, withBorderEffect = true }: ActionButtonProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <Button
      withBorderEffect={withBorderEffect}
      variant={variant}
      className={className}
      onClick={() => {
        if (to) navigate(to);
      }}
    >
      {label}
    </Button>
  );
}

function TableBlock({ columns, rows }: NonNullable<PageConfig['table']>): JSX.Element {
  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/45">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-zinc-400">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/5 text-zinc-200 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FieldGrid({ fields }: { fields?: string[] }): JSX.Element | null {
  if (!fields?.length) return null;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field} className="space-y-1.5 text-xs uppercase tracking-[0.14em] text-zinc-400" role="group" aria-label={`Preview for ${field}`}>
          <span>{field}</span>
          <div className="rounded-xl border border-white/12 bg-black/60 px-3 py-2.5 text-sm normal-case tracking-normal text-zinc-500">
            Input preview
          </div>
        </div>
      ))}
    </div>
  );
}

function LinksBlock({ links }: { links?: PageLink[] }): JSX.Element | null {
  if (!links?.length) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-300">
      {links.map((link) => (
        <Link key={`${link.label}-${link.to}`} className="underline underline-offset-4 hover:text-white" to={link.to}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

function MetricsBlock({ metrics }: { metrics?: string[] }): JSX.Element | null {
  if (!metrics?.length) return null;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-200">
          {metric}
        </div>
      ))}
    </div>
  );
}

function FilterBlock({ filters }: { filters?: string[] }): JSX.Element | null {
  if (!filters?.length) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {filters.map((filter) => (
        <span key={filter} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">
          {filter}
        </span>
      ))}
    </div>
  );
}

function TabsBlock({ tabs }: { tabs?: string[] }): JSX.Element | null {
  if (!tabs?.length) return null;

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tabs.map((tab, index) => (
        <span
          key={tab}
          className={`rounded-full border px-3 py-1.5 text-xs ${
            index === 0 ? 'border-white/30 bg-white/10 text-white' : 'border-white/12 bg-white/[0.02] text-zinc-300'
          }`}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

function HeaderBlock({ config }: Props): JSX.Element {
  return (
    <header>
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{config.eyebrow}</p>
      <h1 className="ef-heading-gradient mt-2 text-4xl font-semibold leading-tight md:text-5xl">{config.title}</h1>
      <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">{config.subtitle}</p>
      <TabsBlock tabs={config.tabs} />
      <FilterBlock filters={config.filters} />
      <MetricsBlock metrics={config.metrics} />
    </header>
  );
}

function PrimaryContent({ config }: Props): JSX.Element {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/45 p-5">
      {config.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {config.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs text-zinc-200">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <FieldGrid fields={config.fields} />
      {config.table ? <TableBlock columns={config.table.columns} rows={config.table.rows} /> : null}
      <LinksBlock links={config.links} />

      {(config.ctaPrimary || config.ctaSecondary) ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {config.ctaPrimary ? (
            <ActionButton
              label={config.ctaPrimary}
              to={config.ctaPrimaryTo}
              variant="primary"
              className="px-5"
              withBorderEffect={false}
            />
          ) : null}
          {config.ctaSecondary ? <ActionButton label={config.ctaSecondary} to={config.ctaSecondaryTo} variant="ghost" /> : null}
        </div>
      ) : null}
    </section>
  );
}

function Rail({ rail }: { rail: NonNullable<PageConfig['rail']> }): JSX.Element {
  return (
    <aside className="rounded-2xl border border-white/10 bg-black/45 p-5">
      <h2 className="text-lg font-semibold text-white">{rail.title}</h2>
      <ul className="mt-3 space-y-2 text-sm text-zinc-300">
        {rail.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {rail.actions?.length ? (
        <div className="mt-4 space-y-2">
          {rail.actions.map((action, index) => (
            <ActionButton
              key={`${action.label}-${action.to}`}
              label={action.label}
              to={action.to}
              variant={index === 0 ? 'primary' : 'ghost'}
              className="w-full justify-center"
              withBorderEffect={index !== 0}
            />
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function RoleLayout({ config }: Props): JSX.Element {
  const cardLinks: PageLink[] = [
    { label: 'Student', to: '/sign-up/student' },
    { label: 'Company', to: '/sign-up/company' },
    { label: 'University Admin', to: '/login' },
  ];

  return (
    <div className="space-y-6">
      <HeaderBlock config={config} />
      <div className="grid gap-4 md:grid-cols-3">
        {cardLinks.map((item) => (
          <article key={item.label} className="ef-card rounded-2xl border border-white/10 bg-black/45 p-5">
            <h3 className="text-lg font-semibold text-white">{item.label}</h3>
            <p className="mt-2 text-sm text-zinc-300">Continue with the {item.label.toLowerCase()} onboarding flow.</p>
            <ActionButton
              label={`Continue as ${item.label}`}
              to={item.to}
              variant="ghost"
              className="mt-4 w-full justify-center"
            />
          </article>
        ))}
      </div>
      <LinksBlock links={config.links} />
    </div>
  );
}

function WorkspaceLayout({ config }: Props): JSX.Element {
  return (
    <div className="space-y-6">
      <HeaderBlock config={config} />
      <div className={`grid gap-4 ${config.rail ? 'lg:grid-cols-[2fr_1fr]' : 'lg:grid-cols-1'}`}>
        <PrimaryContent config={config} />
        {config.rail ? <Rail rail={config.rail} /> : null}
      </div>
    </div>
  );
}

function AuthLayout({ config }: Props): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HeaderBlock config={config} />
      <PrimaryContent config={config} />
    </div>
  );
}

function SystemLayout({ config }: Props): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <HeaderBlock config={config} />
      <PrimaryContent config={config} />
    </div>
  );
}

export function PageScaffold({ config }: Props): JSX.Element {
  const { rootRef, onPointerMove } = useEfCardPointer<HTMLElement>();

  return (
    <main ref={rootRef} onPointerMove={onPointerMove} className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.1]" />
      <div className="pointer-events-none absolute left-[-18rem] top-[-20rem] h-[36rem] w-[36rem] rounded-full bg-white/10 blur-[180px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-6 py-10 md:px-8 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/assets/brand/logo-dark-512.png" alt="Eagle-Foundry" className="h-8 w-8 rounded-full" />
            <span className="text-sm font-semibold tracking-wide text-zinc-100">Eagle-Foundry</span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <ActionButton label="Landing" to="/" variant="ghost" />
            <ActionButton label="Login" to="/login" variant="ghost" />
            <ActionButton label="Student" to="/student/dashboard" variant="ghost" />
            <ActionButton label="Company" to="/company/org" variant="ghost" />
            <ActionButton label="Admin" to="/admin" variant="ghost" />
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="ef-card rounded-3xl border border-white/10 bg-zinc-950/80 p-6 md:p-8"
        >
          {config.kind === 'auth' ? <AuthLayout config={config} /> : null}
          {config.kind === 'workspace' ? <WorkspaceLayout config={config} /> : null}
          {config.kind === 'role' ? <RoleLayout config={config} /> : null}
          {config.kind === 'system' ? <SystemLayout config={config} /> : null}
        </motion.section>
      </div>
    </main>
  );
}
