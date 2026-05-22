// PulseSense — Health Insights Hook
// Loads vitals from a 14-day window and generates insights via the health engine

import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getDB } from './useDB';
import { getVitalLogsByDateRange, type VitalLogRow } from '../db/queries/vitals';
import { generateInsights, type HealthInsight } from '../engine/healthInsights';

function get14DayRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 14);

  const fmt = (d: Date): string => {
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

export function useHealthInsights(): {
  insights: HealthInsight[];
  loading: boolean;
  refresh: () => void;
} {
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const db = await getDB();
      const { start, end } = get14DayRange();
      const vitals: VitalLogRow[] = await getVitalLogsByDateRange(db, start, end);
      const generated = generateInsights(vitals);
      setInsights(generated);
    } catch (err) {
      console.error('[useHealthInsights] Failed to load insights:', err);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return { insights, loading, refresh: load };
}
