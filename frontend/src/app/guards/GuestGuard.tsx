import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/authStore';

const dashboardByRole: Record<string, string> = {
  STUDENT: '/student/dashboard',
  COMPANY_ADMIN: '/company/org',
  COMPANY_MEMBER: '/company/org',
  UNIVERSITY_ADMIN: '/admin',
};

export default function GuestGuard(): JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-black" />;

  if (isAuthenticated && user) {
    const dest = dashboardByRole[user.role] ?? '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}
