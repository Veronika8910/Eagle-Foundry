import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { ApiError, parseApiError } from '@/lib/api/errors';

const BLOCKED_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me'];

const schema = z.object({
  companyName: z.string().min(1, 'Required').max(200),
  firstName: z.string().min(1, 'Required').max(100),
  lastName: z.string().min(1, 'Required').max(100),
  email: z
    .string()
    .email('Invalid email')
    .refine(
      (e) => !BLOCKED_DOMAINS.some((d) => e.toLowerCase().endsWith(`@${d}`)),
      'Please use a company email — consumer email providers are not allowed',
    ),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(128)
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

type FormValues = z.infer<typeof schema>;

export default function CompanySignupPage(): JSX.Element {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await api.post(endpoints.auth.companySignup, values);
      toast.success('Organization created! Check your email for a verification code.');
      navigate('/verify-otp', { state: { email: values.email } });
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : parseApiError(err);
      if (apiErr.isValidation && Object.keys(apiErr.fieldErrors).length > 0) {
        for (const [field, messages] of Object.entries(apiErr.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof FormValues, { message: messages[0] });
          }
        }
      } else {
        toast.error(apiErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Company</p>
      <h1 className="ef-heading-gradient mt-2 text-2xl font-semibold md:text-3xl">Create organization</h1>
      <p className="mt-2 text-sm text-zinc-400">Post opportunities and discover student talent.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input label="Company name" {...register('companyName')} error={errors.companyName?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Your first name" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Your last name" {...register('lastName')} error={errors.lastName?.message} />
        </div>
        <Input label="Work email" type="email" placeholder="you@company.com" {...register('email')} error={errors.email?.message} hint="Consumer email providers (Gmail, Yahoo, etc.) are not accepted" />
        <Input label="Password" type="password" {...register('password')} error={errors.password?.message} hint="Min 8 chars, uppercase, lowercase, number" />

        <Button type="submit" variant="primary" withBorderEffect={false} className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-400">
        <Link to="/login" className="underline underline-offset-4 hover:text-white">Already have an account?</Link>
        <Link to="/sign-up" className="underline underline-offset-4 hover:text-white">Choose a different role</Link>
      </div>
    </div>
  );
}
