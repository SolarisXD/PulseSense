# PulseSense — Technical Requirements Document (TRD)
**Version:** 1.0 | **Status:** V1 Spec

---

## 1. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Mobile Framework | React Native + Expo (SDK 51+) | Reuses React skills, strong ecosystem, Expo simplifies device APIs |
| Local Database | expo-sqlite (SQLite) | Offline-first, no server needed, relational schema support |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) | Industry standard, smooth transitions |
| PDF Generation | react-native-html-to-pdf or expo-print | Converts HTML/CSS templates to PDF locally on device |
| Date Handling | date-fns | Lightweight, reliable date parsing and formatting |
| State Management | Zustand | Lightweight, simple, no boilerplate vs Redux |
| Form Handling | React Hook Form | Controlled forms with validation |
| Charts | Victory Native or react-native-gifted-charts | Mobile-optimized chart components |
| Animations | React Native Reanimated 3 + Moti | Smooth 60fps animations, gesture support |
| Icons | @expo/vector-icons (MaterialCommunityIcons + Feather) | Pre-bundled with Expo |
| Image Picker | expo-image-picker | Profile photo selection |
| Phone Call | expo-linking (tel: URI scheme) | One-tap emergency call |
| Location | expo-location | Display address on emergency screen |
| File System | expo-file-system | Save/share exported PDFs |
| Sharing | expo-sharing | Share PDF via system share sheet |
| Font | expo-google-fonts (Inter family) | Clean medical-appropriate typography |

---

## 2. Project Structure

```
pulsesense/
├── app/                        # Expo Router screens (or /src/screens/ if using React Navigation)
│   ├── (onboarding)/
│   │   ├── welcome.tsx
│   │   ├── features.tsx
│   │   ├── setup-profile.tsx
│   │   └── ready.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── vitals.tsx
│   │   ├── history.tsx
│   │   ├── profile.tsx
│   │   └── alerts.tsx
│   ├── emergency/
│   │   ├── check.tsx
│   │   └── action.tsx
│   ├── vitals/
│   │   ├── log.tsx            # Single or multi vital log form
│   │   └── [id].tsx           # Edit a past log
│   ├── export/
│   │   └── index.tsx
│   ├── medications/
│   │   ├── index.tsx
│   │   ├── add.tsx
│   │   └── [id].tsx
│   ├── conditions/
│   │   ├── index.tsx
│   │   └── add.tsx
│   └── settings.tsx
├── src/
│   ├── db/
│   │   ├── schema.ts           # All CREATE TABLE statements
│   │   ├── migrations.ts       # Version-based migration runner
│   │   ├── seeds.ts            # Default settings seed
│   │   └── queries/
│   │       ├── profile.ts
│   │       ├── vitals.ts
│   │       ├── medications.ts
│   │       ├── conditions.ts
│   │       ├── emergency.ts
│   │       └── settings.ts
│   ├── engine/
│   │   └── ruleEngine.ts       # Core emergency rule engine
│   ├── export/
│   │   ├── pdfTemplates.ts     # HTML/CSS templates per export type
│   │   └── exportService.ts    # Orchestrates PDF generation + sharing
│   ├── utils/
│   │   ├── dateUtils.ts        # DD/MM/YYYY helpers, age calculator, auto-slash
│   │   ├── unitConverter.ts    # C/F, kg/lbs, mg/dL/mmol conversions
│   │   ├── vitalStatus.ts      # Normal/warning/emergency range checker
│   │   └── dosageFormatter.ts  # Format dose_morning/afternoon/night → '1-0-1'
│   ├── store/
│   │   ├── profileStore.ts
│   │   ├── settingsStore.ts
│   │   └── alertStore.ts
│   ├── components/
│   │   ├── ui/                 # Design system components
│   │   ├── vitals/
│   │   ├── medications/
│   │   ├── conditions/
│   │   ├── emergency/
│   │   └── export/
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── rules.ts            # Rule definitions
│   └── hooks/
│       ├── useDB.ts
│       ├── useAgeCalculator.ts
│       ├── useDateInput.ts     # Auto-slash insertion hook
│       └── useVitalStatus.ts
├── assets/
│   ├── logo/
│   ├── onboarding/
│   └── fonts/
└── app.json
```

---

## 3. Key Technical Implementations

### 3.1 Date Input with Auto-Slash

```typescript
// hooks/useDateInput.ts
export function useDateInput(onChange: (val: string) => void) {
  const handleChange = (text: string) => {
    // Strip all non-digits
    const digits = text.replace(/\D/g, '');
    let formatted = '';

    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    // Validate day (01-31) and month (01-12) as user types
    onChange(formatted);
  };

  return { handleChange };
}
```

**Validation rules:**
- Day: 01–31
- Month: 01–12
- Year: 1900–current year (for DOB), 1900–today (for medical dates)
- Future dates: blocked for DOB and all medical record dates

---

### 3.2 Age Calculator

```typescript
// utils/dateUtils.ts
export function calculateAge(dob: string): string {
  // dob format: 'DD/MM/YYYY'
  const [day, month, year] = dob.split('/').map(Number);
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
```

---

### 3.3 Unit Conversions

```typescript
// utils/unitConverter.ts
export const tempCtoF = (c: number) => parseFloat(((c * 9/5) + 32).toFixed(1));
export const tempFtoC = (f: number) => parseFloat(((f - 32) * 5/9).toFixed(1));
export const kgToLbs = (kg: number) => parseFloat((kg * 2.20462).toFixed(1));
export const lbsToKg = (lbs: number) => parseFloat((lbs / 2.20462).toFixed(1));
export const mgdlToMmol = (mg: number) => parseFloat((mg / 18.0182).toFixed(2));
export const mmolToMgdl = (mm: number) => parseFloat((mm * 18.0182).toFixed(0));
```

Vitals are **always stored in base units** (°C, kg, mg/dL) in the DB. Conversion happens at display layer based on user's settings preference.

---

### 3.4 Dosage Formatter

```typescript
// utils/dosageFormatter.ts
export function formatDosage(morning: 0|1, afternoon: 0|1, night: 0|1): string {
  return `${morning}-${afternoon}-${night}`;
  // e.g. '1-0-1', '0-0-1', '1-1-1'
}
```

---

### 3.5 Vital Status Checker

```typescript
// utils/vitalStatus.ts
type Status = 'normal' | 'warning' | 'danger' | 'unknown';

export function getBpStatus(sys: number, dia: number): Status {
  if (sys >= 140 || dia >= 90 || sys < 80 || dia < 60) return 'danger';
  if (sys >= 121 || dia >= 81 || sys < 90 || dia < 60) return 'warning';
  return 'normal';
}

export function getSpo2Status(spo2: number): Status {
  if (spo2 < 90) return 'danger';
  if (spo2 < 95) return 'warning';
  return 'normal';
}

export function getPulseStatus(bpm: number): Status {
  if (bpm > 120 || bpm < 50) return 'danger';
  if (bpm > 100 || bpm < 60) return 'warning';
  return 'normal';
}

// Returns color token name, not hex — use with design system
export function statusToColor(status: Status): string {
  const map = { normal: 'success', warning: 'warning', danger: 'danger', unknown: 'neutral' };
  return map[status];
}
```

---

### 3.6 Rule Engine

```typescript
// engine/ruleEngine.ts

export type SeverityLevel = 'EMERGENCY_NOW' | 'URGENT_SAME_DAY' | 'MONITOR_CLOSELY' | 'LOG_ONLY';

interface SymptomInput {
  // boolean flags for each symptom
  balance_loss?: boolean;
  vision_change?: boolean;
  face_droop?: boolean;
  arm_weakness?: boolean;
  speech_difficulty?: boolean;
  chest_discomfort?: boolean;
  upper_body_pain?: boolean;
  shortness_breath?: boolean;
  cold_sweat?: boolean;
  nausea?: boolean;
  lightheadedness?: boolean;
  rapid_heartbeat?: boolean;
  unconscious?: boolean;
  not_breathing?: boolean;
  severe_bleeding?: boolean;
  anaphylaxis?: boolean;
  fainting?: boolean;
  seizure?: boolean;
  // vitals
  spo2?: number;
  pulse?: number;
  bp_sys?: number;
}

interface RuleResult {
  severity: SeverityLevel;
  ruleId: string;
  category: string;
  message: string;
  triggeredBy: string[];
  actionSteps: string[];
}

export function evaluateSymptoms(input: SymptomInput): RuleResult[] {
  const results: RuleResult[] = [];

  // RULE 1: Cardiac Arrest (highest priority)
  if (input.unconscious && input.not_breathing) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'CARDIAC_ARREST',
      category: 'cardiac_arrest',
      message: 'Possible cardiac arrest detected. Call emergency services immediately and begin CPR.',
      triggeredBy: ['unconscious', 'not_breathing'],
      actionSteps: ['Call emergency services NOW', 'Begin CPR if trained', 'Use AED if available', 'Stay on line with dispatcher']
    });
  }

  // RULE 2: Stroke (BEFAST)
  const strokeSigns = [input.balance_loss, input.vision_change, input.face_droop, input.arm_weakness, input.speech_difficulty];
  const strokeTriggered = ['balance_loss','vision_change','face_droop','arm_weakness','speech_difficulty'].filter((_,i) => strokeSigns[i]);
  if (strokeTriggered.length >= 1) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'STROKE_BEFAST',
      category: 'stroke',
      message: 'Stroke warning signs detected (B.E.F.A.S.T.). Every minute counts — call emergency services now.',
      triggeredBy: strokeTriggered,
      actionSteps: ['Call emergency services immediately', 'Note the exact time symptoms started', 'Do not give food or water', 'Keep person calm and still']
    });
  }

  // RULE 3: Heart Attack
  const heartCoreSign = input.chest_discomfort;
  const heartAssociated = [input.upper_body_pain, input.shortness_breath, input.cold_sweat, input.nausea, input.lightheadedness, input.rapid_heartbeat];
  const heartAssocCount = heartAssociated.filter(Boolean).length;
  if (heartCoreSign || heartAssocCount >= 2) {
    results.push({
      severity: 'EMERGENCY_NOW',
      ruleId: 'HEART_ATTACK',
      category: 'heart_attack',
      message: 'Heart attack warning signs detected. Call emergency services immediately.',
      triggeredBy: [],
      actionSteps: ['Call emergency services NOW', 'Chew aspirin 325mg if not allergic and available', 'Sit or lie in comfortable position', 'Loosen tight clothing', 'Do not drive yourself']
    });
  }

  // RULE 4: Low SpO2
  if (input.spo2 !== undefined) {
    if (input.spo2 < 90) {
      results.push({ severity: 'EMERGENCY_NOW', ruleId: 'SPO2_CRITICAL', category: 'oxygen', message: `SpO2 reading of ${input.spo2}% is critically low. Seek emergency care immediately.`, triggeredBy: ['spo2'], actionSteps: ['Call emergency services', 'Sit upright', 'Breathe slowly and deeply', 'Do not exert yourself'] });
    } else if (input.spo2 < 95) {
      results.push({ severity: 'URGENT_SAME_DAY', ruleId: 'SPO2_LOW', category: 'oxygen', message: `SpO2 of ${input.spo2}% is below normal. Seek medical review today.`, triggeredBy: ['spo2'], actionSteps: ['Rest immediately', 'Call your doctor today', 'Recheck in 10 minutes', 'Go to emergency if it drops further'] });
    }
  }

  // RULE 5: Severe Bleeding
  if (input.severe_bleeding) {
    results.push({ severity: 'EMERGENCY_NOW', ruleId: 'SEVERE_BLEEDING', category: 'bleeding', message: 'Severe bleeding requires immediate emergency response.', triggeredBy: ['severe_bleeding'], actionSteps: ['Apply firm direct pressure to wound', 'Do not remove the cloth if it soaks through — add more', 'Call emergency services', 'Keep person still and warm'] });
  }

  // RULE 6: Anaphylaxis
  if (input.anaphylaxis) {
    results.push({ severity: 'EMERGENCY_NOW', ruleId: 'ANAPHYLAXIS', category: 'allergy', message: 'Severe allergic reaction (anaphylaxis) signs detected. This is life-threatening.', triggeredBy: ['anaphylaxis'], actionSteps: ['Use epinephrine auto-injector (EpiPen) if available', 'Call emergency services immediately', 'Lay person flat with legs elevated unless breathing is difficult', 'Be ready to administer CPR'] });
  }

  // RULE 7: Seizure
  if (input.seizure) {
    results.push({ severity: 'EMERGENCY_NOW', ruleId: 'SEIZURE', category: 'neurological', message: 'Seizure detected. Follow seizure first-aid steps immediately.', triggeredBy: ['seizure'], actionSteps: ['Protect from injury — clear space, cushion head', 'Do NOT restrain or put anything in mouth', 'Time the seizure', 'Call emergency if > 5 minutes or person does not recover', 'Stay with person until fully conscious'] });
  }

  // Default: if no rules fired but form was submitted
  if (results.length === 0) {
    results.push({ severity: 'LOG_ONLY', ruleId: 'NO_EMERGENCY', category: 'none', message: 'No emergency warning signs detected. Continue monitoring and log your vitals.', triggeredBy: [], actionSteps: ['Log your current vitals', 'Monitor for any changes', 'Contact your doctor if symptoms persist'] });
  }

  // Sort by severity: EMERGENCY_NOW first
  const severityOrder = { 'EMERGENCY_NOW': 0, 'URGENT_SAME_DAY': 1, 'MONITOR_CLOSELY': 2, 'LOG_ONLY': 3 };
  return results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
```

---

### 3.7 PDF Export

**Library:** `expo-print` + `expo-sharing`

PDF generation uses HTML string templates rendered via the print API, then saved with `expo-file-system` and shared via `expo-sharing`.

**Template structure per export type:**

```typescript
// export/pdfTemplates.ts

export function buildMedicalIdHtml(profile, conditions, allergies, contacts, medications): string {
  return `
    <html>
    <head>
      <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1C2B3A; margin: 20px; }
        .header { background: #1A5F7A; color: white; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 16px; }
        .header p { margin: 2px 0; font-size: 10px; opacity: 0.85; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #EEF4F7; text-align: left; padding: 6px 8px; border: 1px solid #CBD5E0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 6px 8px; border: 1px solid #CBD5E0; }
        tr:nth-child(even) { background: #F8FAFB; }
        .section-title { font-size: 12px; font-weight: bold; color: #1A5F7A; margin: 12px 0 4px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1A5F7A; padding-bottom: 4px; }
        .badge-danger { background: #FEE2E2; color: #991B1B; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
        .badge-normal { background: #D1FAE5; color: #065F46; padding: 1px 6px; border-radius: 3px; font-size: 9px; }
        .footer { margin-top: 24px; font-size: 9px; color: #9CA3AF; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Medical ID — ${profile.full_name}</h1>
        <p>DOB: ${profile.dob} | Age: ${calculateAge(profile.dob)} | Blood Group: ${profile.blood_group || 'Unknown'}</p>
        <p>Report generated: ${formatTodayDisplay()}</p>
      </div>
      <!-- conditions table, allergies table, medications table, contacts table -->
      <div class="footer">Generated by PulseSense · For informational use only · Not a clinical document</div>
    </body>
    </html>
  `;
}
```

---

## 4. Offline-First Strategy

- All data reads/writes go through local SQLite
- No network calls in V1
- PDF generation is 100% on-device via `expo-print`
- Emergency call uses `expo-linking` tel: URI — works on any network
- Location via `expo-location` — GPS does not require internet

---

## 5. Security Considerations (V1)

- Data never leaves device in V1
- Profile photo stored in app's private document directory
- Exported PDFs saved to temp directory, shared via system share sheet, then deleted from temp
- No analytics, tracking, or remote logging in V1
- SQLite file stored in Expo's secure document directory (not publicly accessible on iOS, restricted on Android)

---

## 6. Performance Guidelines

- Tab screens lazy-loaded
- History table uses FlatList with `getItemLayout` for large datasets
- Vitals charts render only visible range (windowed)
- DB queries indexed on `logged_at_iso` for fast date-range filtering
- Avoid blocking the JS thread during PDF generation — use async and show loading indicator
