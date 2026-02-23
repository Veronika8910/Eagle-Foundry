import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppShell(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute left-[-18rem] top-[-20rem] h-[36rem] w-[36rem] rounded-full bg-white/10 blur-[180px]" />

      <div className="relative z-10 flex h-full flex-col">
        <TopBar onToggleSidebar={toggleSidebar} />

        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:block">
            <Sidebar collapsed={!sidebarOpen} />
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={toggleSidebar} role="button" aria-label="Close sidebar" tabIndex={0}>
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
                <Sidebar />
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto w-full max-w-[1200px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
