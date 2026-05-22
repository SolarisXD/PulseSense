// PulseSense — Date Utilities
// DD/MM/YYYY format for display, ISO for storage/sorting

export function calculateAge(dob: string): string {
  if (!dob) return '';
  const parts = dob.split('/');
  if (parts.length !== 3) return '';
  const [day, month, year] = parts.map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }
  if (today.getDate() < birthDate.getDate()) {
    months--;
  }

  return `${years} yrs ${months} months old`;
}

export function formatTodayDisplay(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

export function formatDateTimeDisplay(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

export function displayToIso(display: string): string {
  // Input: DD/MM/YYYY HH:MM
  // Output: YYYY-MM-DDTHH:MM:00 (local time — no timezone conversion)
  // Store as local ISO so that string-based date-range queries
  // and displays are consistent across the app.
  const [datePart, timePart] = display.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];
  const dd = String(Number(day)).padStart(2, '0');
  const mm = String(Number(month)).padStart(2, '0');
  const hh = String(Number(hours)).padStart(2, '0');
  const mi = String(Number(minutes)).padStart(2, '0');
  return `${year}-${mm}-${dd}T${hh}:${mi}:00`;
}

export function isoToDisplay(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

export function nowDisplay(): string {
  return formatDateTimeDisplay(new Date().toISOString());
}

export function nowIso(): string {
  // Local ISO — no UTC conversion, consistent with displayToIso
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${y}-${m}-${d}T${h}:${mi}:${s}.${ms}`;
}

export function isFutureDate(display: string): boolean {
  // Parse the display string directly as local date (no timezone conversion)
  const [datePart, timePart] = display.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];
  const inputDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
  return inputDate > new Date();
}

export function formatDisplayDate(display: string): string {
  // DD/MM/YYYY HH:MM -> DD/MM/YY (for table display)
  const [datePart] = display.split(' ');
  if (!datePart) return display;
  const [d, m, y] = datePart.split('/');
  const shortYear = y.slice(2);
  return `${d}/${m}/${shortYear}`;
}

export function formatDisplayTime(display: string): string {
  const [, timePart] = display.split(' ');
  return timePart || '';
}

export function getLast30DaysRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const fmt = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };
  return {
    start: `${fmt(start)}T00:00:00`,
    end: `${fmt(end)}T23:59:59`,
  };
}
