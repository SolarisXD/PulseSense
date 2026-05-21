// PulseSense — Database Schema (SQLite)
// All CREATE TABLE statements in dependency order

export const SCHEMA_VERSION = 2;

export const CREATE_TABLES = [
  // 1. settings — key-value store, must exist first for db_version
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );`,

  // 2. profile — single row
  `CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    dob TEXT NOT NULL,
    sex TEXT NOT NULL,
    sex_other_text TEXT,
    blood_group TEXT,
    height_value REAL,
    height_unit TEXT DEFAULT 'cm',
    height_ft INTEGER,
    height_in REAL,
    photo_uri TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`,

  // 3. emergency_contacts
  `CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    contact_type TEXT DEFAULT 'emergency',
    is_primary INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );`,

  // 4. conditions
  `CREATE TABLE IF NOT EXISTS conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    diagnosed_date TEXT,
    severity TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`,

  // 5. allergies
  `CREATE TABLE IF NOT EXISTS allergies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    reaction TEXT,
    severity TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );`,

  // 6. medications
  `CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_date TEXT NOT NULL,
    prescribing_doctor TEXT,
    diagnosis_notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`,

  // 7. medication_items
  `CREATE TABLE IF NOT EXISTS medication_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dose_morning INTEGER DEFAULT 0,
    dose_afternoon INTEGER DEFAULT 0,
    dose_night INTEGER DEFAULT 0,
    timing TEXT,
    timing_custom TEXT,
    duration TEXT,
    strength TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );`,

  // 8. custom_vital_definitions
  `CREATE TABLE IF NOT EXISTS custom_vital_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL,
    normal_min REAL,
    normal_max REAL,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );`,

  // 9. vital_logs
  `CREATE TABLE IF NOT EXISTS vital_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    logged_at_display TEXT NOT NULL,
    logged_at_iso TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    bp_sys INTEGER,
    bp_dia INTEGER,
    bp_position TEXT,
    pulse INTEGER,
    spo2 REAL,
    glucose_value REAL,
    glucose_unit TEXT DEFAULT 'mg/dL',
    glucose_context TEXT,
    temp_value REAL,
    temp_unit TEXT DEFAULT 'C',
    weight_value REAL,
    weight_unit TEXT DEFAULT 'kg',
    pain_level INTEGER,
    pain_location TEXT,
    pain_notes TEXT,
    notes TEXT,
    is_deleted INTEGER DEFAULT 0
  );`,

  // 10. custom_vital_logs
  `CREATE TABLE IF NOT EXISTS custom_vital_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vital_definition_id INTEGER NOT NULL REFERENCES custom_vital_definitions(id),
    vital_log_id INTEGER REFERENCES vital_logs(id) ON DELETE CASCADE,
    logged_at_display TEXT,
    logged_at_iso TEXT,
    value REAL NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );`,

  // 11. symptom_events
  `CREATE TABLE IF NOT EXISTS symptom_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occurred_at TEXT NOT NULL,
    sym_balance_loss INTEGER DEFAULT 0,
    sym_vision_change INTEGER DEFAULT 0,
    sym_face_droop INTEGER DEFAULT 0,
    sym_arm_weakness INTEGER DEFAULT 0,
    sym_speech_difficulty INTEGER DEFAULT 0,
    sym_chest_discomfort INTEGER DEFAULT 0,
    sym_upper_body_pain INTEGER DEFAULT 0,
    sym_shortness_breath INTEGER DEFAULT 0,
    sym_cold_sweat INTEGER DEFAULT 0,
    sym_nausea INTEGER DEFAULT 0,
    sym_lightheadedness INTEGER DEFAULT 0,
    sym_rapid_heartbeat INTEGER DEFAULT 0,
    sym_unconscious INTEGER DEFAULT 0,
    sym_not_breathing INTEGER DEFAULT 0,
    sym_severe_bleeding INTEGER DEFAULT 0,
    sym_anaphylaxis INTEGER DEFAULT 0,
    sym_fainting INTEGER DEFAULT 0,
    sym_seizure INTEGER DEFAULT 0,
    spo2_at_event REAL,
    pulse_at_event INTEGER,
    bp_sys_at_event INTEGER,
    bp_dia_at_event INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );`,

  // 12. rule_triggers
  `CREATE TABLE IF NOT EXISTS rule_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symptom_event_id INTEGER NOT NULL REFERENCES symptom_events(id),
    rule_id TEXT NOT NULL,
    rule_category TEXT NOT NULL,
    severity_level TEXT NOT NULL,
    triggered_conditions TEXT NOT NULL,
    user_message TEXT NOT NULL,
    action_steps TEXT,
    triggered_at TEXT DEFAULT (datetime('now'))
  );`,

  // 13. alerts
  `CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    severity_level TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    vitals_snapshot TEXT,
    symptom_event_id INTEGER REFERENCES symptom_events(id),
    vital_log_id INTEGER REFERENCES vital_logs(id),
    is_resolved INTEGER DEFAULT 0,
    resolved_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );`,
];

// Indexes for performance
export const CREATE_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_vital_logs_date ON vital_logs(logged_at_iso DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_custom_vital_logs_date ON custom_vital_logs(logged_at_iso DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_custom_vital_logs_def ON custom_vital_logs(vital_definition_id);`,
  `CREATE INDEX IF NOT EXISTS idx_vital_logs_not_deleted ON vital_logs(is_deleted);`,
  `CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_rule_triggers_event ON rule_triggers(symptom_event_id);`,
  `CREATE INDEX IF NOT EXISTS idx_medication_items_parent ON medication_items(medication_id);`,
];
