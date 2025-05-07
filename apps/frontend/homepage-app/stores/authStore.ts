import { create } from 'zustand';
import { UserEntity } from '@user-management/types';
import axiosInstance from '@/lib/axiosInstance';

interface AuthState {
  /**
   * Currently authenticated user, or null if not logged in.
   */
  user: UserEntity | null;

  /**
   * Whether the user's session has been checked and `user` is known to be valid or null.
   * Prevents hydration mismatches during initial render.
   */
  hasLoaded: boolean;

  /**
   * Whether the auth store has been mounted in the browser.
   * Prevents rendering sensitive client-only logic during SSR.
   */
  hasMounted: boolean;

  /**
   * Directly set the current user (used internally after login or session load).
   */
  setUser: (user: UserEntity) => void;

  /**
   * Clears the session by sending a logout request to the backend and resetting local state.
   */
  logout: () => Promise<void>;

  /**
   * Loads the current session by calling `/auth/me`.
   * If the HttpOnly cookie is valid, sets the user; otherwise clears it.
   */
  loadUser: () => Promise<UserEntity | null>;

  /**
   * Resets the store to its default initial state (empty).
   */
  initialize: () => void;

  /**
   * Marks the store as mounted in the browser (used for client-only rendering logic).
   */
  markMounted: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hasLoaded: false,
  hasMounted: false,

  setUser: (user) => set({ user }),

  logout: async () => {
    await axiosInstance.post('/auth/logout');
    set({ user: null, hasLoaded: true });
  },

  loadUser: async () => {
    try {
      const res = await axiosInstance.get<UserEntity>('/auth/me'); // cookie automatically sent
      set({ user: res.data, hasLoaded: true });
      return res.data;
    } catch {
      set({ user: null, hasLoaded: true });
      return null;
    }
  },

  initialize: () => {
    set({ user: null, hasLoaded: false });
  },

  markMounted: () => {
    set({ hasMounted: true });
  },
}));
