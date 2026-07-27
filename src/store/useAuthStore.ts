import { create } from 'zustand';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  short: string;
  role: string;
  fn: string;
  team: string;
  color: string;
  cap: number;
  skills: string[];
  permissions: string[];
}

export interface SavedAccount {
  user: UserProfile;
  token: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  accounts: SavedAccount[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserProfile, token: string) => void;
  logout: () => Promise<void>;
  logoutAccount: (userId: string) => Promise<void>;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  switchAccount: (userId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const getSavedAccounts = (): SavedAccount[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('masters_expo_accounts');
    const parsed: SavedAccount[] = raw ? JSON.parse(raw) : [];
    const uniqueMap = new Map<string, SavedAccount>();
    parsed.forEach((acc) => {
      const key = (acc.user.email || acc.user.id || (acc.user as any)._id || '').toLowerCase();
      if (key) uniqueMap.set(key, acc);
    });
    return Array.from(uniqueMap.values());
  } catch (e) {
    return [];
  }
};

const setSavedAccounts = (accounts: SavedAccount[]) => {
  if (typeof window !== 'undefined') {
    // Deduplicate before saving
    const uniqueMap = new Map<string, SavedAccount>();
    accounts.forEach((acc) => {
      const key = (acc.user.email || acc.user.id || (acc.user as any)._id || '').toLowerCase();
      if (key) uniqueMap.set(key, acc);
    });
    const uniqueAccounts = Array.from(uniqueMap.values());
    localStorage.setItem('masters_expo_accounts', JSON.stringify(uniqueAccounts));
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  accounts: getSavedAccounts(),
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      localStorage.setItem('masters_expo_token', token);
      localStorage.setItem('masters_expo_user', JSON.stringify(user));
    }

    // Update saved accounts list with deduplication
    const currentAccounts = getSavedAccounts();
    const userEmail = (user.email || '').toLowerCase();
    const filtered = currentAccounts.filter(
      (acc) => (acc.user.email || '').toLowerCase() !== userEmail
    );
    const updated = [...filtered, { user, token }];
    setSavedAccounts(updated);

    set({ user, token, accounts: updated, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const currentUser = get().user;
    if (currentUser) {
      const currentId = currentUser.id || (currentUser as any)._id;
      await get().logoutAccount(currentId);
    } else {
      await get().logoutAll();
    }
  },

  logoutAccount: async (userId: string) => {
    const currentAccounts = getSavedAccounts();
    const updated = currentAccounts.filter(
      (acc) =>
        (acc.user.id || (acc.user as any)._id) !== userId &&
        (acc.user.email || '').toLowerCase() !== userId.toLowerCase()
    );
    setSavedAccounts(updated);

    const currentUser = get().user;
    const activeId = currentUser ? currentUser.id || (currentUser as any)._id : null;

    if (activeId === userId) {
      if (updated.length > 0) {
        // Switch to next available account
        const next = updated[0];
        if (typeof window !== 'undefined') {
          localStorage.setItem('masters_expo_token', next.token);
          localStorage.setItem('masters_expo_user', JSON.stringify(next.user));
        }
        set({
          user: next.user,
          token: next.token,
          accounts: updated,
          isAuthenticated: true,
          isLoading: false,
        });
        try {
          await api.post('/auth/switch-user', { userId: next.user.id || (next.user as any)._id });
        } catch (e) {
          // Fallback
        }
      } else {
        // Log out completely
        await get().logoutAll();
      }
    } else {
      set({ accounts: updated });
    }
  },

  logoutAll: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('masters_expo_token');
        localStorage.removeItem('masters_expo_user');
        localStorage.removeItem('masters_expo_accounts');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
      }
      set({ user: null, token: null, accounts: [], isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success && res.data.data) {
        const user = res.data.data;
        const token = localStorage.getItem('masters_expo_token') || 'cookie_session';

        // Keep accounts updated with deduplication
        const currentAccounts = getSavedAccounts();
        const userEmail = (user.email || '').toLowerCase();
        const filtered = currentAccounts.filter(
          (acc) => (acc.user.email || '').toLowerCase() !== userEmail
        );
        const updated = [...filtered, { user, token }];
        setSavedAccounts(updated);

        set({ user, token, accounts: updated, isAuthenticated: true, isLoading: false });
        return true;
      }
    } catch (error) {
      // Invalid session
    }

    set({ isLoading: false });
    return false;
  },

  switchAccount: async (userId: string) => {
    // 1. Instant local switch from saved accounts
    const saved = get().accounts.find(
      (acc) =>
        (acc.user.id || (acc.user as any)._id) === userId ||
        (acc.user.email || '').toLowerCase() === userId.toLowerCase()
    );
    if (saved) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('masters_expo_token', saved.token);
        localStorage.setItem('masters_expo_user', JSON.stringify(saved.user));
      }
      set({ user: saved.user, token: saved.token, isAuthenticated: true });
    }

    // 2. Server side session sync
    try {
      const res = await api.post('/auth/switch-user', { userId });
      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        get().login(user, accessToken);
      }
    } catch (error) {
      console.error('Failed to switch account session on server:', error);
    }
  },

  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  },
}));
