import { formatDosage, parseDosage, dosageFrequency } from '../../utils/dosageFormatter';

describe('formatDosage', () => {
  it('formats morning/afternoon/night as M-A-N', () => {
    expect(formatDosage(1, 1, 1)).toBe('1-1-1');
    expect(formatDosage(1, 0, 1)).toBe('1-0-1');
    expect(formatDosage(0, 0, 0)).toBe('0-0-0');
  });
});

describe('parseDosage', () => {
  it('parses M-A-N string into object', () => {
    expect(parseDosage('1-1-1')).toEqual({ morning: 1, afternoon: 1, night: 1 });
    expect(parseDosage('1-0-1')).toEqual({ morning: 1, afternoon: 0, night: 1 });
    expect(parseDosage('0-0-0')).toEqual({ morning: 0, afternoon: 0, night: 0 });
  });

  it('handles undefined parts', () => {
    expect(parseDosage('1-1')).toEqual({ morning: 1, afternoon: 1, night: 0 });
  });
});

describe('dosageFrequency', () => {
  it('returns all times when all doses given', () => {
    const result = dosageFrequency(1, 1, 1);
    expect(result).toBe('Morning, Afternoon, Night');
  });

  it('returns only morning and night', () => {
    const result = dosageFrequency(1, 0, 1);
    expect(result).toBe('Morning, Night');
  });

  it('returns "As needed" for no doses', () => {
    const result = dosageFrequency(0, 0, 0);
    expect(result).toBe('As needed');
  });
});
