jest.mock('../../store/themeStore', () => ({
  useThemeStore: jest.fn(),
}));

import { renderHook } from '@testing-library/react-native';
import { useColors } from '../../hooks/useColors';
import { useThemeStore } from '../../store/themeStore';

const mockedUseThemeStore = useThemeStore as jest.MockedFunction<typeof useThemeStore>;

describe('useColors', () => {
  it('returns light colors when isDark is false', () => {
    mockedUseThemeStore.mockImplementation((selector: any) => {
      const state = { isDark: false };
      return selector(state);
    });
    const { result } = renderHook(() => useColors());
    expect(result.current).toBeDefined();
    expect(result.current.primary).toBeDefined();
    expect(result.current.background).toBeDefined();
  });

  it('returns merged dark colors when isDark is true', () => {
    mockedUseThemeStore.mockImplementation((selector: any) => {
      const state = { isDark: true };
      return selector(state);
    });
    const { result } = renderHook(() => useColors());
    expect(result.current).toBeDefined();
    expect(result.current.primary).toBeDefined();
  });
});
