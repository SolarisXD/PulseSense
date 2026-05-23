import { tryParseNumber, tryParseInt, hasInvalidNumber } from '../../utils/vitalFormHelpers';

describe('tryParseNumber', () => {
  it('parses valid number strings', () => {
    expect(tryParseNumber('123')).toBe(123);
    expect(tryParseNumber('45.6')).toBe(45.6);
    expect(tryParseNumber('0')).toBe(0);
  });

  it('returns null for empty strings', () => {
    expect(tryParseNumber('')).toBe(null);
    expect(tryParseNumber('   ')).toBe(null);
  });

  it('returns null for non-numeric strings', () => {
    expect(tryParseNumber('abc')).toBe(null);
  });
});

describe('tryParseInt', () => {
  it('parses valid integer strings', () => {
    expect(tryParseInt('123')).toBe(123);
    expect(tryParseInt('0')).toBe(0);
  });

  it('returns null for empty strings', () => {
    expect(tryParseInt('')).toBe(null);
  });

  it('returns null for non-numeric strings', () => {
    expect(tryParseInt('abc')).toBe(null);
  });

  it('truncates floats to integers', () => {
    expect(tryParseInt('45.6')).toBe(45);
  });
});

describe('hasInvalidNumber', () => {
  it('returns false when all values are valid', () => {
    expect(hasInvalidNumber(1, 2, 3)).toBe(false);
  });

  it('returns false when nulls are mixed with valid numbers', () => {
    expect(hasInvalidNumber(null, 2, null)).toBe(false);
  });

  it('returns true when NaN is present', () => {
    expect(hasInvalidNumber(1, NaN, 3)).toBe(true);
  });

  it('returns false for empty call', () => {
    expect(hasInvalidNumber()).toBe(false);
  });
});
