// PulseSense — Emergency Rule Engine
// Pure TypeScript function — no external dependencies
// Evaluates symptom flags + optional vitals and returns sorted rule results

import type { SymptomInput, RuleResult, SeverityLevel } from '../constants/rules';
import { SEVERITY_ORDER } from '../constants/rules';

export function evaluateSymptoms(input: SymptomInput): RuleResult[] {
  const results: RuleResult[] = [];

  // ===== RULE 1: Cardiac Arrest (highest priority — hard override) =====
  if (input.unconscious && input.not_breathing) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'CARDIAC_ARREST',
      category: 'cardiac_arrest',
      message: 'Possible cardiac arrest detected. Call emergency services immediately and begin CPR.',
      triggeredBy: ['unconscious', 'not_breathing'],
      actionSteps: [
        'Call emergency services NOW',
        'Begin CPR if trained — push hard and fast in the center of the chest',
        'Use AED if available — turn it on and follow instructions',
        'Stay on line with dispatcher — do not hang up',
        'If alone, call before starting CPR',
      ],
      isHardOverride: true,
      evidenceNote:
        'Sudden collapse + unresponsiveness + not breathing normally are classic cardiac arrest signs. Bystander CPR doubles survival odds.',
    });
  }

  // ===== RULE 2: Stroke (BEFAST — hard override) =====
  const strokeSigns: [string, boolean | undefined][] = [
    ['balance_loss', input.balance_loss],
    ['vision_change', input.vision_change],
    ['face_droop', input.face_droop],
    ['arm_weakness', input.arm_weakness],
    ['speech_difficulty', input.speech_difficulty],
  ];
  const strokeTriggered = strokeSigns.filter(([, val]) => val).map(([key]) => key);

  if (strokeTriggered.length >= 1) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'STROKE_BEFAST',
      category: 'stroke',
      message:
        'Stroke warning signs detected (B.E.F.A.S.T.). Every minute counts — call emergency services now.',
      triggeredBy: strokeTriggered,
      actionSteps: [
        'Call emergency services immediately',
        'Note the exact time symptoms started — this is critical for treatment decisions',
        'Do NOT give food, water, or any medication (including aspirin)',
        'Keep person calm and still — help them lie down with head slightly elevated',
        'Loosen any tight clothing',
        'If person is unconscious, place them in recovery position (on their side)',
      ],
      isHardOverride: true,
      evidenceNote:
        'B.E.F.A.S.T. (Balance, Eyes, Face, Arms, Speech, Time) is the globally recommended stroke recognition tool. Any ONE sign warrants immediate emergency care.',
    });
  }

  // ===== RULE 3: Heart Attack =====
  const heartCoreSign = input.chest_discomfort;
  const heartAssociated = [
    input.upper_body_pain,
    input.shortness_breath,
    input.cold_sweat,
    input.nausea,
    input.lightheadedness,
    input.rapid_heartbeat,
  ];
  const heartAssocCount = heartAssociated.filter(Boolean).length;

  if (heartCoreSign || heartAssocCount >= 2) {
    const triggered: string[] = [];
    if (heartCoreSign) triggered.push('chest_discomfort');
    if (input.upper_body_pain) triggered.push('upper_body_pain');
    if (input.shortness_breath) triggered.push('shortness_breath');
    if (input.cold_sweat) triggered.push('cold_sweat');

    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'HEART_ATTACK',
      category: 'heart_attack',
      message:
        'Heart attack warning signs detected. Call emergency services immediately.',
      triggeredBy: triggered.length > 0 ? triggered : ['symptom_combination'],
      actionSteps: [
        'Call emergency services NOW — do not wait',
        'Sit or lie down in a comfortable position',
        'Loosen tight clothing',
        'If aspirin 325mg is available and you are not allergic — chew one slowly',
        'Do NOT drive yourself — wait for paramedics',
        'Stay calm — anxiety worsens the strain on your heart',
      ],
      isHardOverride: false,
      evidenceNote:
        'Chest discomfort + associated symptoms (pain spreading to arms/back/neck/jaw, shortness of breath, cold sweat, nausea) meet classic heart attack presentation.',
    });
  }

  // ===== RULE 4: SpO2 Assessment =====
  if (input.spo2 !== undefined && input.spo2 !== null) {
    if (input.spo2 < 90) {
      results.push({
        severity: 'EMERGENCY_NOW',
        ruleId: 'SPO2_CRITICAL',
        category: 'oxygen',
        message: `SpO2 reading of ${input.spo2}% is critically low. Seek emergency care immediately.`,
        triggeredBy: ['spo2'],
        actionSteps: [
          'Call emergency services immediately',
          'Sit upright — do not lie flat',
          'Try to breathe slowly and deeply',
          'If you have prescribed oxygen, use it',
          'Do not exert yourself — stay still',
          'If lips or fingernails turn blue/purple, this is a medical emergency',
        ],
        isHardOverride: true,
        evidenceNote:
          'SpO2 < 90% indicates severe hypoxemia requiring immediate medical intervention. Prolonged hypoxemia can cause organ damage.',
      });
    } else if (input.spo2 < 95) {
      results.push({
        severity: 'URGENT_SAME_DAY',
        ruleId: 'SPO2_LOW',
        category: 'oxygen',
        message: `SpO2 of ${input.spo2}% is below normal. Seek medical review today.`,
        triggeredBy: ['spo2'],
        actionSteps: [
          'Rest immediately — do not exert yourself',
          'Sit upright to help lung expansion',
          'Call your doctor today for guidance',
          'Recheck SpO2 in 10 minutes of rest',
          'Go to emergency if it drops below 90% or you feel worse',
        ],
        isHardOverride: false,
        evidenceNote:
          'SpO2 90–94% is below the normal range (95–100%) and may indicate developing respiratory impairment.',
      });
    }
  }

  // ===== RULE 5: Severe Bleeding =====
  if (input.severe_bleeding) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'SEVERE_BLEEDING',
      category: 'bleeding',
      message:
        'Severe bleeding requires immediate emergency response. Apply pressure and call for help.',
      triggeredBy: ['severe_bleeding'],
      actionSteps: [
        'Apply firm direct pressure to the wound with a clean cloth or bandage',
        'Do NOT remove the cloth if it soaks through — add another layer on top',
        'Call emergency services immediately',
        'Keep the person still and warm — cover with a blanket',
        'If possible, elevate the bleeding area above heart level',
        'Do not apply a tourniquet unless trained to do so',
      ],
      isHardOverride: false,
      evidenceNote:
        'Uncontrolled severe bleeding can lead to hypovolemic shock within minutes. Direct pressure is the most effective first-line intervention.',
    });
  }

  // ===== RULE 6: Anaphylaxis =====
  if (input.anaphylaxis) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'ANAPHYLAXIS',
      category: 'allergy',
      message:
        'Severe allergic reaction (anaphylaxis) signs detected. This is life-threatening — act immediately.',
      triggeredBy: ['anaphylaxis'],
      actionSteps: [
        'Use epinephrine auto-injector (EpiPen) if available — inject into outer thigh',
        'Call emergency services immediately',
        'Lay the person flat with legs elevated unless breathing is difficult',
        'If breathing is difficult, let them sit upright',
        'Be ready to administer CPR if they become unconscious',
        'Note the time of epinephrine administration',
      ],
      isHardOverride: false,
      evidenceNote:
        'Anaphylaxis is a severe, life-threatening allergic reaction. Epinephrine is the first-line treatment and must be given promptly.',
    });
  }

  // ===== RULE 7: Seizure =====
  if (input.seizure) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'SEIZURE',
      category: 'neurological',
      message:
        'Seizure detected. Follow seizure first-aid steps immediately.',
      triggeredBy: ['seizure'],
      actionSteps: [
        'Protect from injury — clear away hard or sharp objects, cushion head',
        'Do NOT restrain the person or put anything in their mouth',
        'Time the seizure — call emergency if it lasts more than 5 minutes',
        'Roll them onto their side after jerking stops (recovery position)',
        'Stay with the person until they are fully conscious and oriented',
        'Call emergency services if: seizure > 5 min, repeated seizures, first-time seizure, or person does not wake up',
      ],
      isHardOverride: false,
      evidenceNote:
        'Most seizures end within 1–3 minutes. Prolonged seizures (>5 min) or multiple seizures without recovery require emergency intervention.',
    });
  }

  // ===== Pulse + BP Assessment (URGENT_SAME_DAY) =====
  if (input.pulse !== undefined && input.pulse !== null) {
    if (input.pulse > 120) {
      results.push({
        severity: 'URGENT_SAME_DAY',
        ruleId: 'PULSE_HIGH',
        category: 'heart_attack',
        message: `Your resting pulse is ${input.pulse} bpm — significantly above normal.`,
        triggeredBy: ['pulse'],
        actionSteps: [
          'Rest for 10 minutes and recheck',
          'Avoid caffeine, alcohol, and stimulants',
          'Contact your doctor today if it remains elevated',
          'Go to emergency if accompanied by chest pain, shortness of breath, or fainting',
        ],
        isHardOverride: false,
        evidenceNote:
          'Resting tachycardia > 100 bpm may indicate infection, dehydration, anxiety, or cardiac issues.',
      });
    } else if (input.pulse < 50) {
      results.push({
        severity: 'URGENT_SAME_DAY',
        ruleId: 'PULSE_LOW',
        category: 'heart_attack',
        message: `Your resting pulse is ${input.pulse} bpm — below normal range.`,
        triggeredBy: ['pulse'],
        actionSteps: [
          'If you feel dizzy, lightheaded, or weak — seek medical evaluation today',
          'If you are a trained athlete with no symptoms, this may be normal',
          'Contact your doctor for guidance',
          'Go to emergency if accompanied by fainting or chest discomfort',
        ],
        isHardOverride: false,
        evidenceNote:
          'Bradycardia < 60 bpm can be normal in athletes but may indicate conduction issues in others.',
      });
    }
  }

  // ===== Default: No emergency =====
  if (results.length === 0) {
    results.push({
      severity: 'LOG_ONLY',
      ruleId: 'NO_EMERGENCY',
      category: 'none',
      message:
        'No emergency warning signs detected based on the symptoms you reported. Continue monitoring.',
      triggeredBy: [],
      actionSteps: [
        'Log your current vitals for your records',
        'Monitor for any changes in your condition',
        'Contact your doctor if symptoms persist or worsen',
        'Trust your instincts — if something feels wrong, seek medical attention',
      ],
      isHardOverride: false,
      evidenceNote:
        'No symptom criteria met any emergency rule pathway. This does not replace clinical judgment.',
    });
  }

  // Sort: hard overrides first, then by severity level
  return results.sort((a, b) => {
    if (a.isHardOverride && !b.isHardOverride) return -1;
    if (!a.isHardOverride && b.isHardOverride) return 1;
    const sa = SEVERITY_ORDER[a.severity as SeverityLevel] ?? 999;
    const sb = SEVERITY_ORDER[b.severity as SeverityLevel] ?? 999;
    return sa - sb;
  });
}

// Check a vital log against thresholds and generate alerts
export function evaluateVitalThresholds(vitalLog: {
  bp_sys?: number | null;
  bp_dia?: number | null;
  pulse?: number | null;
  spo2?: number | null;
  temp_value?: number | null;
  glucose_value?: number | null;
  glucose_context?: string | null;
  pain_level?: number | null;
}): {
  source: 'vital_threshold';
  type: string;
  severity_level: string;
  title: string;
  message: string;
} | null {
  // SpO2 check
  if (vitalLog.spo2 !== null && vitalLog.spo2 !== undefined) {
    if (vitalLog.spo2 < 90) {
      return {
        source: 'vital_threshold',
        type: 'emergency',
        severity_level: 'EMERGENCY_NOW',
        title: 'Critical SpO2 Reading',
        message: `SpO2 of ${vitalLog.spo2}% is critically low. This requires immediate medical attention.`,
      };
    }
    if (vitalLog.spo2 < 95) {
      return {
        source: 'vital_threshold',
        type: 'warning',
        severity_level: 'URGENT_SAME_DAY',
        title: 'Low SpO2 Reading',
        message: `SpO2 of ${vitalLog.spo2}% is below normal. Monitor closely and consult your doctor.`,
      };
    }
  }

  // BP check
  if (vitalLog.bp_sys !== null && vitalLog.bp_sys !== undefined && vitalLog.bp_dia !== null && vitalLog.bp_dia !== undefined) {
    if (vitalLog.bp_sys >= 180 || vitalLog.bp_dia >= 120) {
      return {
        source: 'vital_threshold',
        type: 'emergency',
        severity_level: 'EMERGENCY_NOW',
        title: 'Hypertensive Crisis',
        message: `Blood pressure ${vitalLog.bp_sys}/${vitalLog.bp_dia} is at crisis level. Seek emergency care immediately.`,
      };
    }
  }

  return null;
}
