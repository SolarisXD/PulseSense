import { useAlertStore } from '../../store/alertStore';

beforeEach(() => {
  useAlertStore.getState().clear();
});

describe('alertStore', () => {
  it('starts with empty state', () => {
    const state = useAlertStore.getState();
    expect(state.activeAlerts).toEqual([]);
    expect(state.lastEmergencyResult).toBeNull();
    expect(state.lastEmergencyEventId).toBeNull();
  });

  it('setActiveAlerts replaces alerts', () => {
    const mockAlerts = [{ id: 1, source: 'test', type: 'warning', severity_level: 'URGENT_SAME_DAY', title: 'Test', message: 'Test alert', vitals_snapshot: null, symptom_event_id: null, vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '2026-05-22' }];
    useAlertStore.getState().setActiveAlerts(mockAlerts);
    expect(useAlertStore.getState().activeAlerts).toEqual(mockAlerts);
  });

  it('addAlert prepends alert to list', () => {
    const alert1 = { id: 1, source: 'test', type: 'warning', severity_level: 'URGENT_SAME_DAY', title: 'First', message: 'First alert', vitals_snapshot: null, symptom_event_id: null, vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '2026-05-22' };
    const alert2 = { id: 2, source: 'test', type: 'emergency', severity_level: 'EMERGENCY_NOW', title: 'Second', message: 'Second alert', vitals_snapshot: null, symptom_event_id: null, vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '2026-05-22' };
    useAlertStore.getState().addAlert(alert1);
    useAlertStore.getState().addAlert(alert2);
    expect(useAlertStore.getState().activeAlerts).toHaveLength(2);
    expect(useAlertStore.getState().activeAlerts[0].id).toBe(2);
  });

  it('removeAlert removes alert by id', () => {
    useAlertStore.getState().addAlert({ id: 1, source: 'test', type: 'warning', severity_level: 'URGENT_SAME_DAY', title: 'Test', message: 'Test alert', vitals_snapshot: null, symptom_event_id: null, vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '2026-05-22' });
    useAlertStore.getState().addAlert({ id: 2, source: 'test', type: 'warning', severity_level: 'URGENT_SAME_DAY', title: 'Test 2', message: 'Test alert 2', vitals_snapshot: null, symptom_event_id: null, vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '2026-05-22' });
    useAlertStore.getState().removeAlert(1);
    expect(useAlertStore.getState().activeAlerts).toHaveLength(1);
    expect(useAlertStore.getState().activeAlerts[0].id).toBe(2);
  });

  it('setLastEmergencyResult stores result', () => {
    const mockResult = [{ severity: 'EMERGENCY_NOW', ruleId: 'TEST', category: 'test', message: 'Test', triggeredBy: [], actionSteps: [], isHardOverride: false, evidenceNote: '' }];
    useAlertStore.getState().setLastEmergencyResult(mockResult);
    expect(useAlertStore.getState().lastEmergencyResult).toEqual(mockResult);
  });

  it('setLastEmergencyEventId stores event id', () => {
    useAlertStore.getState().setLastEmergencyEventId(42);
    expect(useAlertStore.getState().lastEmergencyEventId).toBe(42);
  });

  it('clear resets all state', () => {
    useAlertStore.getState().addAlert({ id: 1, source: 'test', type: 'warning', severity_level: 'URGENT_SAME_DAY', title: 'Test', message: 'Test alert', vitals_snapshot: null, symptom_event_id: null, vital_log_id: null, is_resolved: 0, resolved_at: null, created_at: '2026-05-22' });
    useAlertStore.getState().setLastEmergencyEventId(99);
    useAlertStore.getState().clear();
    expect(useAlertStore.getState().activeAlerts).toEqual([]);
    expect(useAlertStore.getState().lastEmergencyResult).toBeNull();
    expect(useAlertStore.getState().lastEmergencyEventId).toBeNull();
  });
});
