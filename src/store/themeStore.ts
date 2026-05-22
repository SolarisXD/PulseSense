// PulseSense — Theme Store (Zustand)
// Manages dark mode state and persists preference to SQLite settings table

import { create } from 'zustand';
import { getDB } from '../db/database';
import { setSetting } from '../db/queries/settings';

interface ThemeState {
  isDark: boolean;
  isLoading: boolean;
  setDark: (dark: boolean) => void;
  toggleDark: () => void;
  hydrate: (value: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  isLoading: true,

  setDark: (dark: boolean) => {
    set({ isDark: dark });
    // Persist to DB asynchronously
    getDB()
      .then((db) => setSetting(db, 'dark_mode', dark ? 'true' : 'false'))
      .catch((err) => console.error('[themeStore] Failed to persist dark mode:', err));
  },

  toggleDark: () => {
    const next = !get().isDark;
    get().setDark(next);
  },

  hydrate: (value: string) => {
    set({ isDark: value === 'true', isLoading: false });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
