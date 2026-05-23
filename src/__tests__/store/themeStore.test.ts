jest.mock('../../db/database', () => ({
  getDB: jest.fn().mockResolvedValue({
    runAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../db/queries/settings', () => ({
  setSetting: jest.fn().mockResolvedValue(undefined),
}));

import { useThemeStore } from '../../store/themeStore';

beforeEach(() => {
  useThemeStore.setState({ isDark: false, isLoading: true });
});

describe('themeStore', () => {
  it('starts with light mode default', () => {
    const state = useThemeStore.getState();
    expect(state.isDark).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('hydrate sets dark mode and loading false', () => {
    useThemeStore.getState().hydrate('true');
    expect(useThemeStore.getState().isDark).toBe(true);
    expect(useThemeStore.getState().isLoading).toBe(false);
  });

  it('hydrate with false string sets light mode', () => {
    useThemeStore.getState().hydrate('false');
    expect(useThemeStore.getState().isDark).toBe(false);
    expect(useThemeStore.getState().isLoading).toBe(false);
  });

  it('setDark sets dark mode', () => {
    useThemeStore.getState().setDark(true);
    expect(useThemeStore.getState().isDark).toBe(true);
  });

  it('setDark sets light mode', () => {
    useThemeStore.getState().setDark(false);
    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('toggleDark flips the value', () => {
    useThemeStore.getState().toggleDark();
    expect(useThemeStore.getState().isDark).toBe(true);
    useThemeStore.getState().toggleDark();
    expect(useThemeStore.getState().isDark).toBe(false);
  });

  it('setLoading updates loading', () => {
    useThemeStore.getState().setLoading(false);
    expect(useThemeStore.getState().isLoading).toBe(false);
  });
});
