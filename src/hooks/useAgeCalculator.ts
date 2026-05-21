// PulseSense — Age Calculator Hook

import { useState, useEffect } from 'react';
import { calculateAge } from '../utils/dateUtils';
import { useProfileStore } from '../store/profileStore';

export function useAgeCalculator(): string {
  const dob = useProfileStore((s) => s.profile?.dob ?? null);
  const [age, setAge] = useState('');

  useEffect(() => {
    if (dob) {
      setAge(calculateAge(dob));
    } else {
      setAge('');
    }
  }, [dob]);

  return age;
}
