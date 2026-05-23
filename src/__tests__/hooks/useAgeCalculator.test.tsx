jest.mock('../../store/profileStore', () => ({
  useProfileStore: jest.fn(),
}));

import { renderHook } from '@testing-library/react-native';
import { useAgeCalculator } from '../../hooks/useAgeCalculator';
import { useProfileStore } from '../../store/profileStore';

const mockedUseProfileStore = useProfileStore as jest.MockedFunction<typeof useProfileStore>;

describe('useAgeCalculator', () => {
  it('returns age string when DOB is provided', () => {
    mockedUseProfileStore.mockImplementation((selector: any) => {
      const state = { profile: { dob: '15/05/1990' } };
      return selector(state);
    });
    const { result } = renderHook(() => useAgeCalculator());
    expect(result.current).toMatch(/\d+ yrs \d+ months old/);
  });

  it('returns empty string when no profile', () => {
    mockedUseProfileStore.mockImplementation((selector: any) => {
      const state = { profile: null };
      return selector(state);
    });
    const { result } = renderHook(() => useAgeCalculator());
    expect(result.current).toBe('');
  });

  it('returns empty string when DOB is null', () => {
    mockedUseProfileStore.mockImplementation((selector: any) => {
      const state = { profile: { dob: null } };
      return selector(state);
    });
    const { result } = renderHook(() => useAgeCalculator());
    expect(result.current).toBe('');
  });
});
