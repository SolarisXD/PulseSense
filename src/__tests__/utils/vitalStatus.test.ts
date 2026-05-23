import {
  getBpStatus,
  getPulseStatus,
  getSpo2Status,
  getGlucoseStatus,
  getTempStatus,
  getPainStatus,
  statusToColor,
  statusToLabel,
  getCustomVitalStatus,
} from '../../utils/vitalStatus';

describe('getBpStatus', () => {
  it('returns danger for hypertensive (sys >= 140)', () => {
    expect(getBpStatus(140, 90)).toBe('danger');
  });

  it('returns danger for very low BP (sys < 80)', () => {
    expect(getBpStatus(75, 50)).toBe('danger');
  });

  it('returns warning for elevated BP (sys 121-139)', () => {
    expect(getBpStatus(130, 85)).toBe('warning');
  });

  it('returns normal for healthy BP', () => {
    expect(getBpStatus(110, 70)).toBe('normal');
  });

  it('returns unknown when null', () => {
    expect(getBpStatus(null, 80)).toBe('unknown');
    expect(getBpStatus(120, null)).toBe('unknown');
  });
});

describe('getPulseStatus', () => {
  it('returns danger for tachycardia > 120', () => {
    expect(getPulseStatus(130)).toBe('danger');
  });

  it('returns danger for bradycardia < 50', () => {
    expect(getPulseStatus(45)).toBe('danger');
  });

  it('returns warning for elevated 101-120', () => {
    expect(getPulseStatus(105)).toBe('warning');
  });

  it('returns warning for low 50-59', () => {
    expect(getPulseStatus(55)).toBe('warning');
  });

  it('returns normal for healthy range', () => {
    expect(getPulseStatus(72)).toBe('normal');
  });

  it('returns unknown for null', () => {
    expect(getPulseStatus(null)).toBe('unknown');
  });
});

describe('getSpo2Status', () => {
  it('returns danger for SpO2 < 90', () => {
    expect(getSpo2Status(85)).toBe('danger');
  });

  it('returns warning for SpO2 90-94', () => {
    expect(getSpo2Status(92)).toBe('warning');
  });

  it('returns normal for SpO2 >= 95', () => {
    expect(getSpo2Status(98)).toBe('normal');
  });

  it('returns unknown for null', () => {
    expect(getSpo2Status(null)).toBe('unknown');
  });
});

describe('getGlucoseStatus', () => {
  describe('fasting', () => {
    it('returns danger for very high (> 200)', () => {
      expect(getGlucoseStatus(250, 'fasting')).toBe('danger');
    });

    it('returns danger for very low (< 60)', () => {
      expect(getGlucoseStatus(55, 'fasting')).toBe('danger');
    });

    it('returns warning for elevated (100-200)', () => {
      expect(getGlucoseStatus(110, 'fasting')).toBe('warning');
    });

    it('returns normal for healthy fasting', () => {
      expect(getGlucoseStatus(85, 'fasting')).toBe('normal');
    });
  });

  describe('random/post-meal', () => {
    it('returns danger for very high (> 200)', () => {
      expect(getGlucoseStatus(250, 'post-meal')).toBe('danger');
    });

    it('returns warning for elevated (140-200)', () => {
      expect(getGlucoseStatus(150, 'random')).toBe('warning');
    });

    it('returns normal for healthy random', () => {
      expect(getGlucoseStatus(110, 'random')).toBe('normal');
    });
  });

  it('returns unknown for null value', () => {
    expect(getGlucoseStatus(null, null)).toBe('unknown');
  });
});

describe('getTempStatus', () => {
  it('returns danger for fever (> 38)', () => {
    expect(getTempStatus(38.5)).toBe('danger');
  });

  it('returns danger for hypothermia (< 35.5)', () => {
    expect(getTempStatus(35.0)).toBe('danger');
  });

  it('returns warning for slightly elevated (37.3-38)', () => {
    expect(getTempStatus(37.5)).toBe('warning');
  });

  it('returns normal for healthy temp', () => {
    expect(getTempStatus(36.6)).toBe('normal');
  });

  it('returns unknown for null', () => {
    expect(getTempStatus(null)).toBe('unknown');
  });
});

describe('getPainStatus', () => {
  it('returns danger for severe pain (>= 7)', () => {
    expect(getPainStatus(8)).toBe('danger');
  });

  it('returns warning for moderate pain (4-6)', () => {
    expect(getPainStatus(5)).toBe('warning');
  });

  it('returns normal for mild pain (0-3)', () => {
    expect(getPainStatus(2)).toBe('normal');
  });

  it('returns unknown for null', () => {
    expect(getPainStatus(null)).toBe('unknown');
  });
});

describe('statusToColor', () => {
  it('returns appropriate color keys', () => {
    expect(statusToColor('normal')).toBe('success');
    expect(statusToColor('warning')).toBe('warning');
    expect(statusToColor('danger')).toBe('danger');
    expect(statusToColor('unknown')).toBe('textSecondary');
  });
});

describe('statusToLabel', () => {
  it('returns appropriate labels', () => {
    expect(statusToLabel('normal')).toBe('Normal');
    expect(statusToLabel('warning')).toBe('Borderline');
    expect(statusToLabel('danger')).toBe('High/Low');
    expect(statusToLabel('unknown')).toBe('Unknown');
  });
});

describe('getCustomVitalStatus', () => {
  it('returns danger when below normalMin', () => {
    expect(getCustomVitalStatus(5, 10, 20)).toBe('danger');
  });

  it('returns danger when above normalMax', () => {
    expect(getCustomVitalStatus(25, 10, 20)).toBe('danger');
  });

  it('returns normal when within range', () => {
    expect(getCustomVitalStatus(15, 10, 20)).toBe('normal');
  });

  it('returns normal when no range defined', () => {
    expect(getCustomVitalStatus(15, null, null)).toBe('normal');
  });
});
