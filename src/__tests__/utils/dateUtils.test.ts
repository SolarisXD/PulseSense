import {
  calculateAge,
  formatTodayDisplay,
  formatDateTimeDisplay,
  displayToIso,
  isoToDisplay,
  nowDisplay,
  nowIso,
  isFutureDate,
  formatDisplayDate,
  formatDisplayTime,
  getLast30DaysRange,
} from '../../utils/dateUtils';

describe('calculateAge', () => {
  it('returns age string for valid DOB', () => {
    const age = calculateAge('15/05/1990');
    expect(age).toMatch(/\d+ yrs \d+ months old/);
  });

  it('returns empty string for empty input', () => {
    expect(calculateAge('')).toBe('');
  });

  it('returns empty string for invalid format', () => {
    expect(calculateAge('not-a-date')).toBe('');
  });

  it('returns empty string for NaN parts', () => {
    expect(calculateAge('ab/cd/ef')).toBe('');
  });
});

describe('formatTodayDisplay', () => {
  it('returns DD/MM/YYYY format', () => {
    const result = formatTodayDisplay();
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });
});

describe('formatDateTimeDisplay', () => {
  it('formats ISO string to DD/MM/YYYY HH:MM', () => {
    const result = formatDateTimeDisplay('2026-05-22T14:30:00');
    expect(result).toBe('22/05/2026 14:30');
  });
});

describe('displayToIso', () => {
  it('converts DD/MM/YYYY HH:MM to local ISO string', () => {
    const result = displayToIso('22/05/2026 14:30');
    expect(result).toBe('2026-05-22T14:30:00');
  });

  it('handles single-digit day/month', () => {
    const result = displayToIso('5/5/2026 9:5');
    expect(result).toBe('2026-05-05T09:05:00');
  });
});

describe('isoToDisplay', () => {
  it('converts ISO to DD/MM/YYYY HH:MM', () => {
    const result = isoToDisplay('2026-05-22T14:30:00');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });
});

describe('nowDisplay', () => {
  it('returns current datetime in display format', () => {
    const result = nowDisplay();
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });
});

describe('nowIso', () => {
  it('returns current datetime in local ISO format', () => {
    const result = nowIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/);
  });
});

describe('isFutureDate', () => {
  it('returns false for past date', () => {
    expect(isFutureDate('01/01/2020 12:00')).toBe(false);
  });

  it('returns true for future date', () => {
    expect(isFutureDate('01/01/2099 12:00')).toBe(true);
  });
});

describe('formatDisplayDate', () => {
  it('formats full display to short date', () => {
    expect(formatDisplayDate('22/05/2026 14:30')).toBe('22/05/26');
  });
});

describe('formatDisplayTime', () => {
  it('extracts time portion', () => {
    expect(formatDisplayTime('22/05/2026 14:30')).toBe('14:30');
  });
});

describe('getLast30DaysRange', () => {
  it('returns start and end in ISO date format', () => {
    const range = getLast30DaysRange();
    expect(range.start).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00$/);
    expect(range.end).toMatch(/^\d{4}-\d{2}-\d{2}T23:59:59$/);
  });
});
