# PulseSense — System Architecture
**Version:** 1.0 | **Scope:** V1 (fully local, no backend server)

---

## 1. Architecture Overview

PulseSense V1 is a **fully local, offline-first mobile application**. There is no cloud backend, no API server, and no user account system. All data is stored, processed, and exported on-device.

```
┌─────────────────────────────────────────────────────────┐
│                    PulseSense App                        │
│                                                         │
│  ┌──────────────┐   ┌───────────────┐   ┌───────────┐  │
│  │  UI Layer    │   │  Logic Layer  │   │ Data Layer│  │
│  │              │   │               │   │           │  │
│  │ React Native │◄──│ Zustand Store │◄──│  SQLite   │  │
│  │ Screens      │   │ Rule Engine   │   │  (local)  │  │
│  │ Components   │   │ Export Service│   │           │  │
│  │ Animations   │   │ Unit Converter│   │           │  │
│  └──────────────┘   └───────────────┘   └───────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │               Device APIs (Expo)                 │   │
│  │  Camera | Location | Phone | FileSystem | Print  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Module Breakdown

### 2.1 UI Layer
- React Native screens and components
- React Navigation for routing
- React Native Reanimated 3 + Moti for animations
- Design system (colors, typography, spacing) applied via constants

### 2.2 State Management (Zustand)
- `profileStore` — profile, conditions, allergies, medications, contacts (cached from DB)
- `settingsStore` — user preferences (temp unit, weight unit, etc.)
- `alertStore` — current unresolved alerts, last emergency event

Stores are hydrated from SQLite on app start and kept in sync on mutation.

### 2.3 Database Layer (SQLite)
- All reads/writes via typed query functions in `src/db/queries/`
- Migrations run on startup via version check
- No ORM — raw SQL for control and performance

### 2.4 Rule Engine
- Pure TypeScript function — no external dependencies
- Input: symptom flags + optional vitals snapshot
- Output: sorted array of `RuleResult` (highest severity first)
- Also called on vital save: if a threshold-breaching vital is logged, engine generates a `vital_threshold` alert
- Hard overrides: BEFAST signs, unconscious+not-breathing, SpO2 < 90 are never suppressed

### 2.5 Export Service
- Builds HTML string from templates + DB data
- Calls `expo-print` to render HTML → PDF
- Saves PDF to temp directory via `expo-file-system`
- Opens system share sheet via `expo-sharing`
- Temp file deleted after sharing

### 2.6 Device APIs
| API | Usage |
|---|---|
| `expo-location` | GPS address on emergency action screen |
| `expo-linking` | tel: URI for one-tap emergency / ICE call |
| `expo-image-picker` | Profile photo (camera or gallery) |
| `expo-print` | On-device PDF generation |
| `expo-file-system` | PDF temp storage + management |
| `expo-sharing` | System share sheet for PDF |

---

## 3. Data Flow Diagrams

### 3.1 Vital Logging

```
User fills Log Vital form
         │
         ▼
Validation (required fields for selected vitals, date not future)
         │
         ▼
Unit normalization (F→C, lbs→kg stored in base units)
         │
         ▼
Insert into vital_logs + custom_vital_logs (SQLite)
         │
         ▼
Rule Engine: check vital against thresholds
         │
    Threshold breach?
    ├── YES → Insert alert into alerts table
    │          → Update alertStore
    │          → Show alert banner on Home
    └── NO  → Show success animation on Log screen
```

### 3.2 Emergency Check

```
User selects symptoms + enters optional vitals
         │
         ▼
[Check Now] button
         │
         ▼
ruleEngine.evaluateSymptoms(input)
         │
         ▼
Returns sorted RuleResult[]
         │
         ▼
Insert symptom_event + rule_triggers to SQLite
         │
         ▼
Navigate to Emergency Action Screen
│
├── If EMERGENCY_NOW:
│   Full-screen red severity banner
│   Action steps displayed
│   Emergency call + ICE contact buttons
│   Location display
│
└── If LOG_ONLY:
    Calm confirmation screen
    Suggestion to log vitals and monitor
```

### 3.3 PDF Export

```
User selects export type + options
         │
         ▼
exportService.buildExport(type, options)
         │
         ▼
DB queries: fetch relevant data
(profile, conditions, allergies, vitals in range, medications, alerts)
         │
         ▼
pdfTemplates.buildHtml(data)
→ Returns HTML string with inline CSS
         │
         ▼
expo-print.printToFileAsync({ html })
→ Returns local URI of generated PDF
         │
         ▼
expo-sharing.shareAsync(uri)
→ System share sheet appears
         │
         ▼
expo-file-system.deleteAsync(uri) [cleanup]
```

---

## 4. Rule Engine Architecture

### 4.1 Rule Priority Order

```
Priority 1 (Hard Override — always EMERGENCY_NOW):
  - Cardiac Arrest (unconscious + not breathing)
  - Stroke (any BEFAST sign)
  - SpO2 < 90%

Priority 2 (Symptom combination — EMERGENCY_NOW):
  - Heart Attack (chest discomfort + associated symptoms)
  - Severe Bleeding
  - Anaphylaxis
  - Seizure

Priority 3 (Vital threshold — URGENT_SAME_DAY):
  - SpO2 90–94%
  - BP ≥ 140/90 with symptoms
  - Pulse > 120 or < 50 with symptoms

Priority 4 (Monitoring — MONITOR_CLOSELY):
  - Single mild vital breach
  - Fasting without symptoms

Priority 5 (Log Only):
  - No symptoms, all vitals normal
```

### 4.2 Rule Data Structure

```typescript
interface Rule {
  id: string;
  category: 'stroke' | 'heart_attack' | 'oxygen' | 'cardiac_arrest' | 'bleeding' | 'allergy' | 'neurological';
  conditions: (input: SymptomInput) => boolean;
  severity: SeverityLevel;
  message: string;
  actionSteps: string[];
  isHardOverride: boolean;   // if true, cannot be suppressed by other rules
  evidenceNote: string;      // brief source note for transparency
}
```

### 4.3 Rule Evaluation Loop

```
for each Rule in RULES (sorted by isHardOverride first, then severity):
  if rule.conditions(input) === true:
    add to results[]
    if rule.isHardOverride: mark as cannot-suppress

return results sorted by severity
```

---

## 5. Database Initialization Sequence

```
App Start
│
▼
Open SQLite database (pulsesense.db)
│
▼
PRAGMA foreign_keys = ON
│
▼
Read db_version from settings table (or 0 if table doesn't exist)
│
▼
Run migrations from current_version to latest_version
│
▼
Seed default settings (INSERT OR IGNORE)
│
▼
Check profile table for rows
│
├── 0 rows → navigate to Onboarding
└── 1+ rows → navigate to Home
```

---

## 6. V1 Architecture Constraints

| Constraint | Rationale |
|---|---|
| No cloud / no backend | Privacy, offline-first, no login friction |
| No ML inference | V1 rule-based only; ML is V2.5+ |
| No push notifications | V2 feature (requires background service) |
| No multi-device sync | V2 feature |
| No biometric lock | V2 feature (expo-local-authentication ready to add) |
| SQLite, not Realm or WatermelonDB | Simpler, well-supported in Expo, SQL familiar |
| expo-print for PDF, not third-party PDF lib | Avoids native module complexity; HTML→PDF is flexible |

---

## 7. Future Architecture (V2 Preview)

When cloud is added in V2, the architecture extends to:

```
PulseSense App (local)
│
├── Local SQLite (still primary)
│
└── Sync Queue
    │
    ▼
PulseSense API (Node.js / FastAPI)
    │
    ├── PostgreSQL (cloud data)
    ├── Auth (JWT or Supabase)
    └── Family / Caregiver access layer
```

V1 is designed so that the SQLite schema and query layer can be wrapped in a sync adapter in V2 without changing the UI or logic layers.
