export function tryParseNumber(value: string): number | null {
  if (!value || !value.trim()) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

export function tryParseInt(value: string): number | null {
  if (!value || !value.trim()) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

export function hasInvalidNumber(...values: (number | null)[]): boolean {
  return values.some((v) => v !== null && isNaN(v));
}
