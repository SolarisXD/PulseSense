import { checkDrugInteractions } from '../../engine/drugInteractions';
import type { InteractionResult } from '../../engine/drugInteractions';

describe('drugInteractions module', () => {
  it('exports checkDrugInteractions as a function', () => {
    expect(typeof checkDrugInteractions).toBe('function');
  });

  it('returns empty array when fewer than 2 medications', () => {
    expect(checkDrugInteractions([])).toEqual([]);
    expect(checkDrugInteractions(['aspirin'])).toEqual([]);
  });

  it('returns empty array for non-array input', () => {
    expect(checkDrugInteractions(null as unknown as string[])).toEqual([]);
    expect(checkDrugInteractions(undefined as unknown as string[])).toEqual([]);
  });

  it('returns InteractionResult shape for known interaction', () => {
    const results = checkDrugInteractions(['aspirin', 'warfarin']);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const result = results[0];
    expect(result).toHaveProperty('drugA');
    expect(result).toHaveProperty('drugB');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('effect');
    expect(result).toHaveProperty('recommendation');
  });

  it('detects major interaction between ibuprofen and warfarin', () => {
    const results = checkDrugInteractions(['ibuprofen', 'warfarin']);
    const match = results.find(
      (r) => r.drugA.toLowerCase() === 'ibuprofen' && r.drugB.toLowerCase() === 'warfarin'
    );
    expect(match).toBeDefined();
    expect(match!.severity).toBe('major');
  });

  it('detects moderate interaction between lisinopril and losartan', () => {
    const results = checkDrugInteractions(['lisinopril', 'losartan']);
    const match = results.find(
      (r) => r.drugA.toLowerCase() === 'lisinopril' && r.drugB.toLowerCase() === 'losartan'
    );
    expect(match).toBeDefined();
    expect(match!.severity).toBe('moderate');
  });

  it('returns empty array for non-interacting medications', () => {
    const results = checkDrugInteractions(['acetaminophen', 'loratadine']);
    expect(results).toEqual([]);
  });

  it('handles case-insensitive matching', () => {
    const results = checkDrugInteractions(['ASPIRIN', 'WARFARIN']);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('deduplicates interactions when same pair of medications', () => {
    const results = checkDrugInteractions(['aspirin', 'warfarin', 'aspirin']);
    const ids = results.map((r) => [r.drugA, r.drugB].sort().join('-'));
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('exports InteractionResult interface', () => {
    const result: InteractionResult = {
      drugA: 'aspirin',
      drugB: 'warfarin',
      severity: 'major',
      effect: 'Increased bleeding risk',
      recommendation: 'Monitor closely',
    };
    expect(result.severity).toBe('major');
  });
});
