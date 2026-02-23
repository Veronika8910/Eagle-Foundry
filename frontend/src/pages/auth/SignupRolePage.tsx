import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const roles = [
  {
    key: 'student',
    label: 'Student',
    icon: GraduationCap,
    desc: 'Launch startups, build your portfolio, and join teams.',
    to: '/sign-up/student',
  },
  {
    key: 'company',
    label: 'Company',
    icon: Building2,
    desc: 'Post opportunities, discover talent, and invest in projects.',
    to: '/sign-up/company',
  },
  {
    key: 'admin',
    label: 'University Admin',
    icon: Shield,
    desc: 'Manage the platform, review submissions, and moderate content.',
    to: '/login',
  },
] as const;

export default function SignupRolePage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Get Started</p>
        <h1 className="ef-heading-gradient mt-2 text-3xl font-semibold md:text-4xl">Choose your role</h1>
        <p className="mt-2 text-sm text-zinc-400">Start as a student builder, company partner, or university admin.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {roles.map((role, i) => (
          <motion.button
            key={role.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            onClick={() => navigate(role.to)}
            className="ef-card group rounded-2xl border border-white/10 bg-black/45 p-8 text-left transition-colors hover:border-white/20"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5">
              <role.icon size={28} className="text-zinc-300" />
            </div>
            <h3 className="text-xl font-semibold text-white">{role.label}</h3>
            <p className="mt-3 text-base text-zinc-400">{role.desc}</p>
            <span className="ef-button ef-button-ghost inline-flex items-center justify-center rounded-full px-5 py-3 text-base font-medium mt-6 w-full text-white">
              Continue as {role.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400">
        <Link to="/login" className="underline underline-offset-4 hover:text-white">Already have an account</Link>
        <Link to="/" className="underline underline-offset-4 hover:text-white">Back to landing</Link>
      </div>
    </div>
  );
}
