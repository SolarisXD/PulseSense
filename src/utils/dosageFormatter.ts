// PulseSense — Dosage Formatting
// Converts morning/afternoon/night booleans to '1-0-1' display format

export function formatDosage(morning: number, afternoon: number, night: number): string {
  return `${morning}-${afternoon}-${night}`;
}

export function parseDosage(dosage: string): { morning: number; afternoon: number; night: number } {
  const parts = dosage.split('-').map(Number);
  return {
    morning: parts[0] || 0,
    afternoon: parts[1] || 0,
    night: parts[2] || 0,
  };
}

export function dosageFrequency(morning: number, afternoon: number, night: number): string {
  const parts: string[] = [];
  if (morning) parts.push('Morning');
  if (afternoon) parts.push('Afternoon');
  if (night) parts.push('Night');
  return parts.join(', ') || 'As needed';
}
