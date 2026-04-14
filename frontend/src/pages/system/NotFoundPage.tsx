import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-black/10 dark:bg-white/10 blur-[180px]" />

      <div className="relative z-10 text-center">
        <p className="text-[clamp(5rem,20vw,12rem)] font-bold leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.2)]">
          404
        </p>
        <h1 className="ef-heading-gradient mt-2 text-2xl font-semibold md:text-3xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--foreground)]">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" withBorderEffect={false} onClick={() => navigate('/')}>
            Go home
          </Button>
          <Button variant="ghost" onClick={() => navigate('/search')}>
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
