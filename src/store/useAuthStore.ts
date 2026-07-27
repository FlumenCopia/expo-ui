import { create } from 'zustand';
import { api } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  short: string;
  role: string;
  roleRef?: string;
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
  logoutAccount: (userIdOrEmail: string) => Promise<void>;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  switchAccount: (userIdOrEmail: string) => Promise<void>;
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
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, acc);
      }
    });
    return Array.from(uniqueMap.values());
  } catch (e) {
    return [];
  }
};

/**
 * Synchronizes localStorage with current accounts array.
 * Rule: Index 0 (accounts[0]) is ALWAYS the currently active session!
 */
const syncStorageWithAccounts = (accounts: SavedAccount[]) => {
  if (typeof window === 'undefined') return;

  const uniqueMap = new Map<string, SavedAccount>();
  accounts.forEach((acc) => {
    const key = (acc.user.email || acc.user.id || (acc.user as any)._id || '').toLowerCase();
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, acc);
    }
  });

  const uniqueList = Array.from(uniqueMap.values());
  localStorage.setItem('masters_expo_accounts', JSON.stringify(uniqueList));

  if (uniqueList.length > 0) {
    const active = uniqueList[0];
    localStorage.setItem('masters_expo_token', active.token);
    localStorage.setItem('masters_expo_user', JSON.stringify(active.user));
  } else {
    localStorage.removeItem('masters_expo_token');
    localStorage.removeItem('masters_expo_user');
  }
};

const initialAccounts = getSavedAccounts();
const activeAccount = initialAccounts.length > 0 ? initialAccounts[0] : null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: activeAccount ? activeAccount.user : null,
  token: activeAccount ? activeAccount.token : null,
  accounts: initialAccounts,
  isAuthenticated: !!activeAccount,
  isLoading: false,

  login: (user, token) => {
    const current = getSavedAccounts();
    const userEmail = (user.email || '').toLowerCase();

    // Filter out if user already exists in saved list
    const filtered = current.filter(
      (acc) => (acc.user.email || '').toLowerCase() !== userEmail
    );

    // Prepend new account to TOP (Index 0)
    const updated = [{ user, token }, ...filtered];
    syncStorageWithAccounts(updated);

    set({
      user,
      token,
      accounts: updated,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    const currentUser = get().user;
    if (currentUser) {
      await get().logoutAccount(currentUser.id || currentUser.email);
    } else {
      await get().logoutAll();
    }
  },

  logoutAccount: async (userIdOrEmail: string) => {
    const current = getSavedAccounts();
    const targetKey = (userIdOrEmail || '').toLowerCase();

    const updated = current.filter(
      (acc) =>
        (acc.user.id || (acc.user as any)._id || '').toLowerCase() !== targetKey &&
        (acc.user.email || '').toLowerCase() !== targetKey
    );

    syncStorageWithAccounts(updated);

    if (updated.length > 0) {
      const active = updated[0];
      set({
        user: active.user,
        token: active.token,
        accounts: updated,
        isAuthenticated: true,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    } else {
      set({
        user: null,
        token: null,
        accounts: [],
        isAuthenticated: false,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
        window.location.href = '/login';
      }
      set({ user: null, token: null, accounts: [], isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    const current = getSavedAccounts();
    if (current.length === 0) {
      set({ isLoading: false, isAuthenticated: false, user: null, token: null, accounts: [] });
      return false;
    }

    const active = current[0];
    set({
      user: active.user,
      token: active.token,
      accounts: current,
      isAuthenticated: true,
      isLoading: false,
    });

    try {
      const res = await api.get('/auth/profile');
      if (res.data.success && res.data.data) {
        const updatedUser = res.data.data;
        const updatedAccounts = [...current];
        updatedAccounts[0] = { ...active, user: updatedUser };
        syncStorageWithAccounts(updatedAccounts);

        set({
          user: updatedUser,
          accounts: updatedAccounts,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // If index 0 token is invalid, remove it and switch to next saved account
        get().logoutAccount(active.user.id || active.user.email);
      }
    }

    set({ isLoading: false });
    return false;
  },

  switchAccount: async (userIdOrEmail: string) => {
    const current = getSavedAccounts();
    const targetKey = (userIdOrEmail || '').toLowerCase();

    const targetAccount = current.find(
      (acc) =>
        (acc.user.id || (acc.user as any)._id || '').toLowerCase() === targetKey ||
        (acc.user.email || '').toLowerCase() === targetKey
    );

    if (targetAccount) {
      // Move selected account to index 0 (TOP)!
      const filtered = current.filter(
        (acc) =>
          (acc.user.id || (acc.user as any)._id || '').toLowerCase() !== targetKey &&
          (acc.user.email || '').toLowerCase() !== targetKey
      );

      const updated = [targetAccount, ...filtered];
      syncStorageWithAccounts(updated);

      set({
        user: targetAccount.user,
        token: targetAccount.token,
        accounts: updated,
        isAuthenticated: true,
        isLoading: false,
      });
    }

    // Sync session on backend
    try {
      const res = await api.post('/auth/switch-user', { userId: userIdOrEmail });
      if (res.data.success && res.data.data) {
        const { accessToken, user } = res.data.data;
        get().login(user, accessToken);
      }
    } catch (error) {
      console.error('Backend switch account sync error:', error);
    }

    // Refresh browser location to clear React Query caches and re-evaluate full page permissions
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  },

  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user) return false;
    if (user.permissions && user.permissions.includes('*')) return true;
    return user.permissions ? user.permissions.includes(permission) : false;
  },
}));
