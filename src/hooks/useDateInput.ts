// PulseSense — Date Input Hook (Auto-Slash for DD/MM/YYYY)
// Automatically inserts slashes as user types digits

import { useState, useCallback } from 'react';

export function useDateInput() {
  const [value, setValue] = useState('');

  const handleChange = useCallback((text: string) => {
    // Strip non-digits
    const digits = text.replace(/\D/g, '');
    let formatted = '';

    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    setValue(formatted);
  }, []);

  const reset = useCallback(() => setValue(''), []);

  const isValid = useCallback((): boolean => {
    if (value.length !== 10) return false;
    const [day, month, year] = value.split('/').map(Number);
    if (!day || !month || !year) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    return true;
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    reset,
    isValid,
  };
}

// DateTime input hook (DD/MM/YYYY HH:MM)
export function useDateTimeInput(initialValue?: string) {
  const [value, setValue] = useState(initialValue || '');

  const handleChange = useCallback((text: string) => {
    // Allow digits, slash, space, colon
    const cleaned = text.replace(/[^\d/: ]/g, '');
    const digits = cleaned.replace(/\D/g, '');
    let formatted = '';

    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length <= 8) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    } else {
      const date = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
      const time = `${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
      formatted = `${date} ${time}`;
    }

    setValue(formatted);
  }, []);

  const reset = useCallback(() => setValue(''), []);

  return { value, setValue, handleChange, reset };
}
