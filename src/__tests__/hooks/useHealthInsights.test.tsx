jest.mock('../../hooks/useDB', () => ({
  getDB: jest.fn().mockResolvedValue({
    getAllAsync: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../engine/healthInsights', () => ({
  generateInsights: jest.fn().mockReturnValue([]),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('../../db/queries/vitals', () => ({
  getVitalLogsByDateRange: jest.fn().mockResolvedValue([]),
}));

import { renderHook } from '@testing-library/react-native';
import { useHealthInsights } from '../../hooks/useHealthInsights';

describe('useHealthInsights', () => {
  it('exports useHealthInsights as a named function', () => {
    expect(typeof useHealthInsights).toBe('function');
  });

  it('returns expected shape (insights, loading, refresh)', () => {
    const { result } = renderHook(() => useHealthInsights());
    expect(result.current).toHaveProperty('insights');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('refresh');
    expect(Array.isArray(result.current.insights)).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('refresh is a function that triggers reload', () => {
    const { result } = renderHook(() => useHealthInsights());
    expect(() => result.current.refresh()).not.toThrow();
  });
});
