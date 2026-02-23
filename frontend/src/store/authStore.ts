import { create } from 'zustand';
import { api, setAccessToken, unwrapApiData } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { User, UserRole, LoginPayload } from '@/lib/api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  silentRefresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (payload) => {
    const { data } = await api.post(endpoints.auth.login, payload);
    const auth = unwrapApiData<{ accessToken: string }>(data);
    setAccessToken(auth.accessToken);
    await get().fetchMe();
  },

  logout: async () => {
    try {
      await api.post(endpoints.auth.logout, {});
    } catch {
      /* swallow — we clear state regardless */
    }
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get(endpoints.auth.me);
      const user = unwrapApiData<User>(data);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      get().reset();
    }
  },

  silentRefresh: async () => {
    try {
      const { data } = await api.post(endpoints.auth.refresh, {});
      const auth = unwrapApiData<{ accessToken: string }>(data);
      setAccessToken(auth.accessToken);
      await get().fetchMe();
    } catch {
      get().reset();
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  reset: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

// Derived selectors
export function useAuth() {
  const store = useAuthStore();
  return {
    ...store,
    role: store.user?.role ?? null,
    isStudent: store.user?.role === 'STUDENT',
    isCompanyAdmin: store.user?.role === 'COMPANY_ADMIN',
    isCompanyMember: store.user?.role === 'COMPANY_ADMIN' || store.user?.role === 'COMPANY_MEMBER',
    isUniversityAdmin: store.user?.role === 'UNIVERSITY_ADMIN',
    hasRole: (...roles: UserRole[]) => !!store.user && roles.includes(store.user.role),
  };
}
