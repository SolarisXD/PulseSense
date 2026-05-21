# PulseSense — Backend Schema
**Version:** 1.0 | **Database:** SQLite via expo-sqlite | **Date Format:** DD/MM/YYYY (stored as TEXT)

---

## Design Principles

- All dates stored as TEXT in `DD/MM/YYYY` format for display consistency
- All timestamps stored as ISO 8601 (`YYYY-MM-DDTHH:MM:SS`) internally for sorting
- `logged_at_display` stores user-facing time; `created_at` stores actual insert time
- All vitals fields are nullable — single-vital logging is supported
- `is_active` / `is_deleted` flags used for soft deletes (no hard deletes on health data)
- Foreign keys enforced via PRAGMA foreign_keys = ON at app startup

---

## Entity Relationship Overview

```
profile (1)
  ├── emergency_contacts (many)
  ├── conditions (many)
  ├── allergies (many)
  └── medications (many)
        └── medication_items (many)

vital_logs (many)
  └── custom_vital_logs (many) → custom_vital_definitions (many)

symptom_events (many)
  └── rule_triggers (many)

alerts (many)
settings (key-value)
```

---

## Tables

---

### `profile`
One row only. App checks this table on startup to decide onboarding vs home.

```sql
CREATE TABLE IF NOT EXISTS profile (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name         TEXT NOT NULL,
  dob               TEXT NOT NULL,         -- DD/MM/YYYY
  sex               TEXT NOT NULL,         -- see gender options in PRD 6.2a
  sex_other_text    TEXT,                  -- used if sex = 'Other'
  blood_group       TEXT,                  -- 'A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'
  height_value      REAL,
  height_unit       TEXT DEFAULT 'cm',     -- 'cm' or 'ft_in'
  height_ft         INTEGER,               -- used if height_unit = 'ft_in'
  height_in         REAL,
  photo_uri         TEXT,                  -- local file path to profile image
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);
```

---

### `emergency_contacts`

```sql
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  relationship     TEXT,                   -- 'Spouse','Parent','Child','Sibling','Friend','Doctor','Other'
  phone            TEXT NOT NULL,
  is_primary       INTEGER DEFAULT 0,      -- 1 = primary ICE contact
  sort_order       INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT (datetime('now'))
);
```

---

### `conditions`
Each condition is a card in the UI. No paragraph structure.

```sql
CREATE TABLE IF NOT EXISTS conditions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,          -- e.g. 'CKD Stage 5', 'Type 2 Diabetes'
  type             TEXT,                   -- 'chronic','acute','genetic','autoimmune','other'
  diagnosed_date   TEXT,                   -- DD/MM/YYYY
  severity         TEXT,                   -- 'mild','moderate','severe'
  notes            TEXT,
  is_active        INTEGER DEFAULT 1,      -- 0 = archived
  sort_order       INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);
```

---

### `allergies`

```sql
CREATE TABLE IF NOT EXISTS allergies (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,          -- e.g. 'Penicillin', 'Shellfish', 'Latex'
  category         TEXT,                   -- 'drug','food','environmental','other'
  reaction         TEXT,                   -- e.g. 'Hives, swelling'
  severity         TEXT,                   -- 'mild','moderate','severe','life-threatening'
  is_active        INTEGER DEFAULT 1,
  created_at       TEXT DEFAULT (datetime('now'))
);
```

---

### `medications`
Master record per prescription.

```sql
CREATE TABLE IF NOT EXISTS medications (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  prescription_date    TEXT NOT NULL,      -- DD/MM/YYYY
  prescribing_doctor   TEXT,
  diagnosis_notes      TEXT,               -- what this prescription was for
  is_active            INTEGER DEFAULT 1,  -- 0 = past/inactive prescription
  created_at           TEXT DEFAULT (datetime('now')),
  updated_at           TEXT DEFAULT (datetime('now'))
);
```

---

### `medication_items`
One row per medicine within a prescription.

```sql
CREATE TABLE IF NOT EXISTS medication_items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  medication_id    INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  medicine_name    TEXT NOT NULL,
  dose_morning     INTEGER DEFAULT 0,      -- 0 = no, 1 = yes
  dose_afternoon   INTEGER DEFAULT 0,
  dose_night       INTEGER DEFAULT 0,
  -- Display helper: computed as '1-0-1' format in app layer, not stored
  timing           TEXT,                   -- 'before_meal','after_meal','with_meal','morning','evening','bedtime','custom'
  timing_custom    TEXT,                   -- used only if timing = 'custom'
  duration         TEXT,                   -- '7 days', '14 days', 'Ongoing', custom text
  strength         TEXT,                   -- e.g. '500mg', '10mg'
  notes            TEXT,
  sort_order       INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT (datetime('now'))
);
```

---

### `vital_logs`
Single-vital logging: all columns nullable except id and logged_at fields.

```sql
CREATE TABLE IF NOT EXISTS vital_logs (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Timestamps
  logged_at_display    TEXT NOT NULL,      -- DD/MM/YYYY HH:MM (user-entered or current)
  logged_at_iso        TEXT NOT NULL,      -- YYYY-MM-DDTHH:MM:SS (for sorting/querying)
  created_at           TEXT DEFAULT (datetime('now')),

  -- Blood Pressure
  bp_sys               INTEGER,            -- mmHg
  bp_dia               INTEGER,            -- mmHg
  bp_position          TEXT,               -- 'sitting','standing','lying'

  -- Pulse
  pulse                INTEGER,            -- bpm

  -- SpO2
  spo2                 REAL,               -- percentage e.g. 98.5

  -- Glucose
  glucose_value        REAL,
  glucose_unit         TEXT DEFAULT 'mg/dL', -- 'mg/dL' or 'mmol/L'
  glucose_context      TEXT,               -- 'fasting','post_meal','random','pre_meal'

  -- Temperature
  temp_value           REAL,
  temp_unit            TEXT DEFAULT 'C',   -- 'C' or 'F'

  -- Weight
  weight_value         REAL,
  weight_unit          TEXT DEFAULT 'kg',  -- 'kg' or 'lbs'

  -- Pain
  pain_level           INTEGER,            -- 0-10
  pain_location        TEXT,               -- e.g. 'Left chest', 'Lower back'
  pain_notes           TEXT,

  -- General
  notes                TEXT,               -- general session notes

  is_deleted           INTEGER DEFAULT 0   -- soft delete
);
```

**Index:**
```sql
CREATE INDEX IF NOT EXISTS idx_vital_logs_date ON vital_logs(logged_at_iso DESC);
```

---

### `custom_vital_definitions`
User-defined vitals (e.g. Cholesterol, Waist Circumference, eGFR).

```sql
CREATE TABLE IF NOT EXISTS custom_vital_definitions (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL UNIQUE,   -- e.g. 'Total Cholesterol'
  unit             TEXT NOT NULL,          -- e.g. 'mg/dL', 'cm', 'L/min'
  normal_min       REAL,                   -- optional lower bound
  normal_max       REAL,                   -- optional upper bound
  notes            TEXT,                   -- e.g. 'Fasting value preferred'
  is_active        INTEGER DEFAULT 1,
  sort_order       INTEGER DEFAULT 0,
  created_at       TEXT DEFAULT (datetime('now'))
);
```

---

### `custom_vital_logs`
One row per custom vital per logging session.

```sql
CREATE TABLE IF NOT EXISTS custom_vital_logs (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  vital_definition_id  INTEGER NOT NULL REFERENCES custom_vital_definitions(id),
  vital_log_id         INTEGER REFERENCES vital_logs(id) ON DELETE CASCADE,
  -- If logged standalone (not tied to a vital_logs session):
  logged_at_display    TEXT,               -- DD/MM/YYYY HH:MM
  logged_at_iso        TEXT,               -- YYYY-MM-DDTHH:MM:SS
  value                REAL NOT NULL,
  notes                TEXT,
  created_at           TEXT DEFAULT (datetime('now'))
);
```

**Index:**
```sql
CREATE INDEX IF NOT EXISTS idx_custom_vital_logs_date ON custom_vital_logs(logged_at_iso DESC);
CREATE INDEX IF NOT EXISTS idx_custom_vital_logs_def ON custom_vital_logs(vital_definition_id);
```

---

### `symptom_events`
Logged when user runs emergency check.

```sql
CREATE TABLE IF NOT EXISTS symptom_events (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at          TEXT NOT NULL,      -- ISO timestamp

  -- Stroke / BEFAST
  sym_balance_loss     INTEGER DEFAULT 0,
  sym_vision_change    INTEGER DEFAULT 0,
  sym_face_droop       INTEGER DEFAULT 0,
  sym_arm_weakness     INTEGER DEFAULT 0,
  sym_speech_difficulty INTEGER DEFAULT 0,

  -- Heart attack
  sym_chest_discomfort INTEGER DEFAULT 0,
  sym_upper_body_pain  INTEGER DEFAULT 0,  -- arm, back, neck, jaw, stomach
  sym_shortness_breath INTEGER DEFAULT 0,
  sym_cold_sweat       INTEGER DEFAULT 0,
  sym_nausea           INTEGER DEFAULT 0,
  sym_lightheadedness  INTEGER DEFAULT 0,
  sym_rapid_heartbeat  INTEGER DEFAULT 0,

  -- Critical
  sym_unconscious      INTEGER DEFAULT 0,
  sym_not_breathing    INTEGER DEFAULT 0,
  sym_severe_bleeding  INTEGER DEFAULT 0,
  sym_anaphylaxis      INTEGER DEFAULT 0,  -- severe allergic reaction

  -- Other
  sym_fainting         INTEGER DEFAULT 0,
  sym_seizure          INTEGER DEFAULT 0,

  -- Vitals captured at time of event
  spo2_at_event        REAL,
  pulse_at_event       INTEGER,
  bp_sys_at_event      INTEGER,
  bp_dia_at_event      INTEGER,

  notes                TEXT,
  created_at           TEXT DEFAULT (datetime('now'))
);
```

---

### `rule_triggers`
Log of which rules fired during a symptom event.

```sql
CREATE TABLE IF NOT EXISTS rule_triggers (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  symptom_event_id     INTEGER NOT NULL REFERENCES symptom_events(id),
  rule_id              TEXT NOT NULL,      -- e.g. 'STROKE_BEFAST', 'HEART_ATTACK_FULL'
  rule_category        TEXT NOT NULL,      -- 'stroke','heart_attack','oxygen','bleeding','allergy','cardiac_arrest'
  severity_level       TEXT NOT NULL,      -- 'EMERGENCY_NOW','URGENT_SAME_DAY','MONITOR_CLOSELY','LOG_ONLY'
  triggered_conditions TEXT NOT NULL,      -- JSON array of symptom keys that triggered
  user_message         TEXT NOT NULL,      -- display message
  action_steps         TEXT,               -- JSON array of action strings
  triggered_at         TEXT DEFAULT (datetime('now'))
);
```

---

### `alerts`
System-generated alerts from rule engine or vital threshold breaches.

```sql
CREATE TABLE IF NOT EXISTS alerts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  source           TEXT NOT NULL,          -- 'rule_engine','vital_threshold','manual'
  type             TEXT NOT NULL,          -- 'emergency','warning','info'
  severity_level   TEXT NOT NULL,          -- 'EMERGENCY_NOW','URGENT_SAME_DAY','MONITOR_CLOSELY'
  title            TEXT NOT NULL,
  message          TEXT NOT NULL,
  vitals_snapshot  TEXT,                   -- JSON of vitals at time of alert
  symptom_event_id INTEGER REFERENCES symptom_events(id),
  vital_log_id     INTEGER REFERENCES vital_logs(id),
  is_resolved      INTEGER DEFAULT 0,
  resolved_at      TEXT,
  created_at       TEXT DEFAULT (datetime('now'))
);
```

---

### `settings`
Key-value store for user preferences.

```sql
CREATE TABLE IF NOT EXISTS settings (
  key              TEXT PRIMARY KEY,
  value            TEXT NOT NULL,
  updated_at       TEXT DEFAULT (datetime('now'))
);
```

**Default seed rows (inserted on first launch):**
```sql
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('temp_unit', 'C'),
  ('weight_unit', 'kg'),
  ('glucose_unit', 'mg/dL'),
  ('height_unit', 'cm'),
  ('bp_default_position', 'sitting'),
  ('onboarding_complete', 'false');
```

---

## Vital Threshold Reference
Used by the rule engine for alert generation on vital log save.

| Vital | Normal Range | Warning | Emergency |
|---|---|---|---|
| SpO2 | 96–100% | 92–95% | < 90% |
| Pulse (adult, resting) | 60–100 bpm | 101–120 or 50–59 | > 120 or < 50 |
| BP Systolic | 90–120 mmHg | 121–139 or 80–89 | ≥ 140 or < 80 |
| BP Diastolic | 60–80 mmHg | 81–89 | ≥ 90 or < 60 |
| Temperature (°C) | 36.1–37.2 | 37.3–38.0 or 35.5–36.0 | > 38.0 or < 35.5 |
| Glucose fasting (mg/dL) | 70–99 | 100–125 or 60–69 | > 200 or < 60 |
| Pain Level | 0–3 | 4–6 | 7–10 |

> Note: These are general adult reference ranges. [Medium confidence — verify against latest clinical guidelines before hardcoding into production.] Ranges should be clearly labelled as "general reference" in the UI, not personalized medical advice.

---

## Migration Strategy

- DB version stored in `settings` table: key = `db_version`
- On app startup: compare stored version to current schema version
- If mismatch: run migration scripts in order
- Never drop columns; add new columns with defaults using `ALTER TABLE ... ADD COLUMN`

---

## DB Initialization Order

```
1. settings
2. profile
3. emergency_contacts
4. conditions
5. allergies
6. medications → medication_items
7. custom_vital_definitions
8. vital_logs → custom_vital_logs
9. symptom_events → rule_triggers
10. alerts
```
