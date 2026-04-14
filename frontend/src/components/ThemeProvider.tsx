import { useEffect } from 'react';

/**
 * Drop this once inside App.tsx (or main.tsx) above RouterProvider.
 * It reads localStorage before the first paint so there's no flash.
 * Defaults to LIGHT if nothing is stored.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  useEffect(() => {
    const stored = localStorage.getItem('ef-theme');
    // Default is now light — only switch to dark if explicitly stored
    const theme = stored === 'dark' ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, []);

  return <>{children}</>;
}
