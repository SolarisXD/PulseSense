# PulseSense — Product Requirements Document (PRD)
**Version:** 1.0 | **Status:** Finalized for V1 Build | **Format:** DD/MM/YYYY

---

## 1. Product Overview

**PulseSense** is a local-first, offline-capable mobile health companion that helps individuals and caregivers track personal vitals, manage medical information, and navigate medical emergencies using a rule-based triage engine — without requiring cloud connectivity or making diagnostic claims.

> "Not a doctor. Not a diagnosis. The right action, at the right moment."

---

## 2. Problem Statement

In a medical emergency or health scare, most people either freeze, search Google in panic, or lack organized access to their own health data. Existing health apps either:
- Focus only on tracking with no action guidance
- Attempt AI diagnosis (unsafe, often inaccurate)
- Require continuous connectivity
- Export data in raw app-screenshot formats, not readable medical documents

PulseSense bridges this gap with a triage engine, clean vitals history, and lab-report-quality exports — all offline.

---

## 3. Target Users

| User Type | Description |
|---|---|
| **Primary** | Adults managing chronic conditions (diabetes, hypertension, CKD, heart disease) |
| **Secondary** | Caregivers managing health data for elderly family members |
| **Tertiary** | Health-conscious individuals who want structured vitals logging |
| **Situational** | Anyone in or near a medical emergency who needs guided action |

---

## 4. Goals for V1

| Goal | Metric |
|---|---|
| Allow fast emergency symptom triage | < 3 taps to reach action screen |
| Enable single-vital or multi-vital logging | Works without filling all fields |
| Produce professional PDF exports | Lab-report style with tables |
| Function fully offline | 100% core features available without internet |
| Show onboarding only once | Profile existence = skip onboarding |

---

## 5. What Makes PulseSense Different

| Feature | PulseSense | Other Apps |
|---|---|---|
| Rule-based emergency triage engine | ✅ Built-in, offline | ❌ Rare or absent |
| Single-vital logging | ✅ Log just one vital at a time | ❌ Most require full form |
| Retroactive vitals entry (custom time) | ✅ Log past readings with timestamp | ❌ Usually only current time |
| Pain scale as a vital (0–10 + location) | ✅ Structured, with body location | ❌ Not standard |
| Custom user-defined vitals | ✅ Name + unit + normal range | ❌ Fixed vitals only |
| Lab-report style PDF exports | ✅ Tabular, clinical format | ❌ Screenshot or basic CSV |
| Export single vital type | ✅ Choose what to export | ❌ All or nothing |
| Conditions displayed as cards | ✅ Card-per-condition, easy to add | ❌ Usually paragraph/text |
| Medical ID export | ✅ One-page shareable medical ID | ❌ Usually no export |
| Medication dosage in (M/A/N) format | ✅ Structured morning/afternoon/night | ❌ Usually freetext |
| Dual unit support (C/F, kg/lbs) | ✅ User-defined defaults in settings | ❌ Fixed units |
| Offline-first, no login required | ✅ SQLite local storage | ❌ Most need account/cloud |

---

## 6. Feature Requirements

### 6.1 Onboarding
- Shown **only once** — when no profile exists in the database
- Multi-screen walkthrough with transitions and animations
- Screens: Welcome → What PulseSense Does → Emergency Features → Set Up Profile → Ready
- After profile creation, app always opens to Home directly
- Splash screen with logo shown on every app open (1.5–2 seconds)

---

### 6.2 Profile
- **Fields:**
  - Full name
  - Date of birth (DD/MM/YYYY — auto-insert slashes)
  - Age display (auto-calculated: "28 yrs 3 months old", updates live from DOB)
  - Sex / Gender (diverse dropdown — see section 6.2a)
  - Blood group (A+, A−, B+, B−, AB+, AB−, O+, O−, Unknown)
  - Profile photo (from camera or gallery)
  - Height (cm or ft/in based on settings)
- **Emergency Contacts** (up to 5)
  - Name, relationship, phone, primary flag
- **Conditions** (card-per-condition, not paragraph)
  - Each card: condition name, type (chronic/acute/genetic/other), diagnosed date (DD/MM/YYYY), severity (mild/moderate/severe), notes
  - Tap to edit, swipe to archive
- **Allergies** (list with severity tags: mild / moderate / severe / life-threatening)
- **Medications** (see section 6.3)

#### 6.2a Sex / Gender Dropdown Options
Male | Female | Non-binary | Transgender Male | Transgender Female | Genderqueer | Intersex | Prefer not to say | Other (free text)

---

### 6.3 Medications
- **Prescription block (master fields):**
  - Prescription date (DD/MM/YYYY)
  - Prescribing doctor name
  - Notes / Diagnosis for this prescription
- **Medication items (multiple per prescription):**
  - Medicine name
  - Dosage format: `Morning / Afternoon / Night` as (0 or 1 per slot), displayed as `1-0-1`, `0-0-1`, `1-1-1`, etc.
  - Timing: Before meal | After meal | With meal | Evening | Morning | Bedtime | Custom (free text)
  - Duration: e.g. "7 days", "14 days", "Ongoing", custom
  - Notes per medicine
- Multiple prescriptions can exist (each with its own date and doctor)
- Active/inactive toggle per prescription

---

### 6.4 Vitals Logging

#### 6.4a Standard Vitals (all optional individually)
| Vital | Fields | Unit |
|---|---|---|
| Blood Pressure | Systolic, Diastolic, Position (sitting/standing/lying) | mmHg |
| Pulse | BPM value | bpm |
| SpO2 | Percentage | % |
| Glucose | Value + context (fasting / post-meal / random) | mg/dL or mmol/L |
| Temperature | Value | °C or °F (user default, convertible) |
| Weight | Value | kg or lbs (user default, convertible) |
| Pain Level | 0–10 scale (see 6.4b), body location (text), pain notes | – |

#### 6.4b Pain Scale Definitions (displayed in UI when logging pain)
| Level | Label | Description |
|---|---|---|
| 0 | No pain | No discomfort at all |
| 1 | Barely noticeable | Very mild, rarely think about it |
| 2 | Minor | Annoying, occasional sharp moments |
| 3 | Noticeable | Distracting, can get used to it |
| 4 | Moderate | Ignorable during activity, still distracting |
| 5 | Moderately strong | Cannot ignore beyond a few minutes |
| 6 | Moderately stronger | Avoiding normal activities, concentration affected |
| 7 | Strong | Prevents normal activities |
| 8 | Very strong | Hard to do anything |
| 9 | Severe | Cannot carry on a conversation |
| 10 | Worst possible | Unbearable |

- Additional field: **Location of pain** (free text, e.g. "Left chest", "Lower back")
- Additional field: **Pain notes**

#### 6.4c Custom Vitals
- User can define new vitals: Name + Unit + Normal Range (min/max, optional)
- Examples: Cholesterol (mg/dL), Waist Circumference (cm), Creatinine (mg/dL), eGFR, HbA1c, Peak Flow (L/min), Uric Acid
- These appear alongside standard vitals in the logging form
- Custom vitals are shown in history with their defined unit

#### 6.4d Logging Time
- Default: current date and time (pre-filled)
- User can clear and enter a **past date and time** (DD/MM/YYYY HH:MM)
- Future dates are blocked
- Field label: "Reading taken at" with clock icon

#### 6.4e Notes
- Each log session has an optional **general notes** field
- Pain vital has its own notes field (separate)

---

### 6.5 Vitals History
- **Filter/Dropdown:** Select one or multiple vital types to display
- **Tabular format:**
  - Columns: Date | Time | [Selected Vital Columns]
  - Sorted by date descending
  - Color-coded values (green = normal, amber = borderline, red = abnormal)
  - Scrollable horizontally if many vitals selected
- **Single vital view:** Shows only that vital's history in a clean table + sparkline chart above
- **Export** directly from history screen (see section 6.7)

---

### 6.6 Emergency Engine (Rule-Based)
- Entry: "Emergency Check" button on home screen (always prominent)
- Symptom checklist by category
- Rule output: `EMERGENCY_NOW` | `URGENT_SAME_DAY` | `MONITOR_CLOSELY` | `LOG_ONLY`
- Action screen shows: what triggered, why it matters, what to do now
- One-tap emergency call + ICE contact + address display

**Emergency Pathways (V1):**
1. Stroke — B.E.F.A.S.T. (Balance, Eyes, Face, Arms, Speech, Time)
2. Heart Attack — chest discomfort + spreading pain + associated symptoms
3. Low SpO2 / Breathing Distress — SpO2 < 90% or sudden severe breathlessness
4. Unconsciousness / Cardiac Arrest — unresponsive + not breathing normally
5. Severe Bleeding
6. Severe Allergic Reaction (Anaphylaxis)

---

### 6.7 PDF Export

**Export types (user selects what to export):**

| Export Type | Contents |
|---|---|
| Medical ID | Name, DOB, age, blood group, conditions, allergies, emergency contacts — one page |
| Vitals Report | Tabular history of selected vital(s) with date range selector |
| Medications | All active prescriptions with dosage table |
| Emergency Alerts | Log of rule_trigger events with severity and timestamp |
| Full Report | All of the above combined |

**PDF Style Rules:**
- Clinical, table-based layout (NOT app screenshot)
- Header: Patient name, DOB, age, blood group, date of report, PulseSense watermark
- Each section in its own table with borders
- Normal/abnormal range annotations where applicable
- Font: clean sans-serif (Helvetica or similar)
- Color: minimal — dark headers, white rows, alternating light row backgrounds
- Footer: "Generated by PulseSense — for informational use only. Not a clinical document."

---

### 6.8 Settings
| Setting | Options |
|---|---|
| Temperature unit | °C (default) / °F |
| Weight unit | kg (default) / lbs |
| Glucose unit | mg/dL (default) / mmol/L |
| Height unit | cm / ft+in |
| Date display format | DD/MM/YYYY (fixed, not changeable) |
| Default BP position | Sitting / Standing / Lying |
| App theme | System / Light / Dark (V2) |

---

## 7. Out of Scope — V1

The following are explicitly excluded from V1:

- RAG / AI-powered Q&A
- Lab report OCR or PDF parsing
- Disease prediction or diagnosis models
- LSTM / RNN inference
- Cloud sync or backend server
- Doctor/family sharing dashboard
- Wearable device integration (V2)
- Medication reminders / push notifications (V2)
- Trend prediction / anomaly detection (V2)

---

## 8. Future Roadmap

| Version | Key Addition |
|---|---|
| V1.5 | Medication reminders, push notifications, charts/trends |
| V2 | Cloud sync, multi-device, family/caregiver access |
| V2.5 | LSTM/GRU deterioration risk model on logged sequences |
| V3 | Wearable integration (Apple Watch, Wear OS), lab report OCR |
