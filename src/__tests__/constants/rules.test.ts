import { SEVERITY_ORDER, type SeverityLevel } from '../../constants/rules';

describe('rules constants', () => {
  it('SEVERITY_ORDER has correct ordering', () => {
    expect(SEVERITY_ORDER.EMERGENCY_NOW).toBeLessThan(SEVERITY_ORDER.URGENT_SAME_DAY);
    expect(SEVERITY_ORDER.URGENT_SAME_DAY).toBeLessThan(SEVERITY_ORDER.MONITOR_CLOSELY);
    expect(SEVERITY_ORDER.MONITOR_CLOSELY).toBeLessThan(SEVERITY_ORDER.LOG_ONLY);
  });

  it('has all severity levels', () => {
    const levels: SeverityLevel[] = ['EMERGENCY_NOW', 'URGENT_SAME_DAY', 'MONITOR_CLOSELY', 'LOG_ONLY'];
    for (const level of levels) {
      expect(SEVERITY_ORDER[level]).toBeDefined();
    }
  });
});
