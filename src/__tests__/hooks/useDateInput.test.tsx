import { renderHook, act } from '@testing-library/react-native';
import { useDateInput, useDateTimeInput } from '../../hooks/useDateInput';

describe('useDateInput', () => {
  it('returns initial empty value', () => {
    const { result } = renderHook(() => useDateInput());
    expect(result.current.value).toBe('');
  });

  it('formats digits as DD/MM/YYYY', () => {
    const { result } = renderHook(() => useDateInput());
    act(() => { result.current.handleChange('15051990'); });
    expect(result.current.value).toBe('15/05/1990');
  });

  it('handles partial input (first 2 digits)', () => {
    const { result } = renderHook(() => useDateInput());
    act(() => { result.current.handleChange('15'); });
    expect(result.current.value).toBe('15');
  });

  it('handles partial input (4 digits with slash)', () => {
    const { result } = renderHook(() => useDateInput());
    act(() => { result.current.handleChange('1505'); });
    expect(result.current.value).toBe('15/05');
  });

  it('strips non-digit characters', () => {
    const { result } = renderHook(() => useDateInput());
    act(() => { result.current.handleChange('15/05/1990abc'); });
    expect(result.current.value).toBe('15/05/1990');
  });

  it('resets value to empty string', () => {
    const { result } = renderHook(() => useDateInput());
    act(() => { result.current.handleChange('15051990'); });
    expect(result.current.value).toBe('15/05/1990');
    act(() => { result.current.reset(); });
    expect(result.current.value).toBe('');
  });

  describe('isValid', () => {
    it('returns true for valid date', () => {
      const { result } = renderHook(() => useDateInput());
      act(() => { result.current.handleChange('15051990'); });
      expect(result.current.isValid()).toBe(true);
    });

    it('returns false for short value', () => {
      const { result } = renderHook(() => useDateInput());
      act(() => { result.current.handleChange('15'); });
      expect(result.current.isValid()).toBe(false);
    });

    it('returns false for invalid month', () => {
      const { result } = renderHook(() => useDateInput());
      act(() => { result.current.handleChange('15131990'); });
      expect(result.current.isValid()).toBe(false);
    });

    it('returns false for year out of range', () => {
      const { result } = renderHook(() => useDateInput());
      act(() => { result.current.handleChange('15051800'); });
      expect(result.current.isValid()).toBe(false);
    });
  });

  it('exposes setValue to set arbitrary value', () => {
    const { result } = renderHook(() => useDateInput());
    act(() => { result.current.setValue('01/01/2026'); });
    expect(result.current.value).toBe('01/01/2026');
  });
});

describe('useDateTimeInput', () => {
  it('returns initial empty value', () => {
    const { result } = renderHook(() => useDateTimeInput());
    expect(result.current.value).toBe('');
  });

  it('accepts an initial value', () => {
    const { result } = renderHook(() => useDateTimeInput('15/05/1990 14:30'));
    expect(result.current.value).toBe('15/05/1990 14:30');
  });

  it('formats datetime input', () => {
    const { result } = renderHook(() => useDateTimeInput());
    act(() => { result.current.handleChange('150519901430'); });
    expect(result.current.value).toBe('15/05/1990 14:30');
  });

  it('resets value to empty string', () => {
    const { result } = renderHook(() => useDateTimeInput('15/05/1990 14:30'));
    act(() => { result.current.reset(); });
    expect(result.current.value).toBe('');
  });
});
