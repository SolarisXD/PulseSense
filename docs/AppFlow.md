# PulseSense — App Flow
**Version:** 1.0

---

## 1. App Entry Logic

```
App Launch
    │
    ▼
Splash Screen (logo animation, 1.8s)
    │
    ▼
Check DB: profile table has rows?
    │
   YES ──────────────────────────► Home Screen (Bottom Tab Navigator)
    │
   NO
    │
    ▼
Onboarding Flow
    │
    ▼
Profile Created
    │
    ▼
Home Screen (Bottom Tab Navigator)
```

**Rule:** Once `onboarding_complete = 'true'` in settings AND a profile row exists, onboarding is never shown again — even after app restarts.

---

## 2. Navigation Structure

```
Root Stack
├── Splash Screen
├── Onboarding Stack (conditional — shown once)
│   ├── Welcome
│   ├── Features Overview
│   ├── Setup Profile
│   └── Ready
│
└── Main App (Bottom Tab Navigator)
    ├── Home Tab
    │   └── Stack
    │       ├── Home Screen
    │       ├── Emergency Check Screen
    │       └── Emergency Action Screen
    │
    ├── Vitals Tab
    │   └── Stack
    │       ├── Log Vital Screen (vital selector → form)
    │       ├── Edit Vital Log Screen
    │       └── Custom Vital Definition Screen
    │
    ├── History Tab
    │   └── Stack
    │       ├── History Screen (tabular, filterable)
    │       └── Vital Detail Screen (single vital chart + table)
    │
    ├── Profile Tab
    │   └── Stack
    │       ├── Profile Screen
    │       ├── Edit Profile Screen
    │       ├── Conditions List Screen
    │       │   ├── Add/Edit Condition Screen
    │       ├── Allergies Screen
    │       ├── Medications Screen
    │       │   ├── Add Prescription Screen
    │       │   └── Edit Prescription Screen
    │       └── Emergency Contacts Screen
    │
    └── More / Alerts Tab
        └── Stack
            ├── Alerts History Screen
            ├── Export Screen
            └── Settings Screen
```

---

## 3. Onboarding Flow

Each screen has a full-screen illustration, heading, subtext, and a Next/Get Started button.

```
┌─────────────────────────────────┐
│  Screen 1: Welcome              │
│  Logo + "PulseSense"            │
│  "Your personal health          │
│   companion and emergency guide"│
│                      [Get Started]
└─────────────────────────────────┘
         │ slide transition →
┌─────────────────────────────────┐
│  Screen 2: Emergency Triage     │
│  Illustration: phone + alert    │
│  "Know what to do in a medical  │
│   emergency, step by step"      │
│                          [Next] │
└─────────────────────────────────┘
         │ slide transition →
┌─────────────────────────────────┐
│  Screen 3: Vitals Tracking      │
│  Illustration: vitals chart     │
│  "Log BP, SpO2, glucose and     │
│   more — one vital at a time"   │
│                          [Next] │
└─────────────────────────────────┘
         │ slide transition →
┌─────────────────────────────────┐
│  Screen 4: Set Up Your Profile  │
│  Inline profile form            │
│  (name, DOB, sex, blood group)  │
│  Optional: emergency contact    │
│                      [Continue] │
└─────────────────────────────────┘
         │ slide transition →
┌─────────────────────────────────┐
│  Screen 5: You're Ready         │
│  Checkmark animation            │
│  "PulseSense is set up"         │
│  "Your data stays on this       │
│   device — always."             │
│               [Go to Home →]    │
└─────────────────────────────────┘
```

Progress dots shown at bottom of screens 1–5.

---

## 4. Home Screen Flow

```
Home Screen
├── Emergency Button (top, always visible, red pulsing ring animation)
│   └── TAP → Emergency Check Screen
│
├── Latest Vitals Summary (horizontal scroll cards)
│   └── TAP any card → History filtered to that vital
│
├── Active Alert Banner (if any EMERGENCY_NOW or URGENT_SAME_DAY unresolved)
│   └── TAP → Emergency Action Screen or Alerts Screen
│
└── Quick Log Shortcut (FAB or button)
    └── TAP → Vital Selector Modal → Log Vital Screen
```

---

## 5. Emergency Flow

```
Emergency Check Screen
│
├── Section: What is happening? (symptom category buttons)
│   ├── Possible Stroke (B.E.F.A.S.T.)
│   ├── Chest Pain / Heart Attack
│   ├── Trouble Breathing / Low Oxygen
│   ├── Unconscious / Not Breathing
│   ├── Severe Bleeding
│   ├── Severe Allergic Reaction
│   └── Other / Not Sure
│
├── On category select → Expand symptom checklist for that category
│   (checkboxes for individual symptoms)
│
├── Optional: Quick vitals entry (SpO2, Pulse, BP)
│
└── [Check Now] button
    │
    ▼
Rule Engine evaluates symptoms + vitals
    │
    ▼
Emergency Action Screen
    │
    ├── Severity Banner (EMERGENCY_NOW = full-screen red / URGENT = amber / etc.)
    ├── "What triggered this" section (list of matched symptoms)
    ├── "What to do now" step-by-step list (numbered, large text)
    ├── Quick Actions:
    │   ├── [📞 Call Emergency Services] (tel: 112 / configurable)
    │   ├── [📞 Call ICE Contact] (primary emergency contact)
    │   ├── [📍 My Location] (show GPS address, copy button)
    │   └── [✅ Mark Resolved]
    └── [Save This Event to History] button
```

---

## 6. Vitals Logging Flow

```
Vital Selector Modal (bottom sheet)
│
├── Standard Vitals:
│   BP | Pulse | SpO2 | Glucose | Temperature | Weight | Pain Level
│
├── Custom Vitals:
│   [user-defined vitals listed]
│
├── [+ Add Custom Vital] shortcut
│
└── User selects one or more vitals → [Log Selected] button
    │
    ▼
Log Vital Screen
│
├── Header: "Reading taken at" date/time field
│   ├── Default: current date and time (pre-filled)
│   ├── User can edit to past date/time (DD/MM/YYYY HH:MM)
│   └── Future dates blocked
│
├── Forms shown only for selected vitals:
│   ├── BP: Systolic | Diastolic | Position dropdown
│   ├── Pulse: BPM field
│   ├── SpO2: Percentage field → real-time status badge
│   ├── Glucose: Value | Unit toggle | Context (fasting/post-meal/random)
│   ├── Temperature: Value | Unit toggle (C/F, respects settings default)
│   ├── Weight: Value | Unit toggle (kg/lbs, respects settings default)
│   ├── Pain: Slider 0–10 | Pain scale descriptor shown live | Location field | Pain notes
│   └── Custom vitals: Value field with unit label and normal range reference
│
├── General Notes field (always shown, optional)
│
└── [Save Reading] button
    │
    ▼
Success animation → brief summary card shown
│
└── Options: [Log Another] | [View in History] | [Back to Home]
```

---

## 7. History Screen Flow

```
History Screen
│
├── Filter Bar (top):
│   Dropdown: All Vitals | BP | Pulse | SpO2 | Glucose | Temperature | Weight | Pain | [custom vitals]
│   Date Range picker (optional, defaults to last 30 days)
│
├── Table View:
│   Columns: Date | Time | [selected vital columns]
│   Color-coded cells: green/amber/red based on thresholds
│   Rows sorted by date descending
│   Tap row → Vital Detail Screen
│
└── Action Bar (bottom):
    [Export Selected] button → Export Screen (pre-filtered to current selection)
```

```
Vital Detail Screen (single vital view)
│
├── Sparkline chart (last 14 readings)
├── Table (all readings for that vital, date + time + value + notes)
└── [Export This Vital] button
```

---

## 8. Export Flow

```
Export Screen
│
├── Step 1: Choose Export Type
│   ☐ Medical ID
│   ☐ Vitals Report
│   ☐ Medications
│   ☐ Emergency Alerts
│   ☐ Full Report (all above)
│
├── Step 2 (if Vitals Report selected):
│   Which vitals? (multi-select: BP, Pulse, SpO2, etc.)
│   Date range? (Last 7 days / 30 days / 3 months / Custom)
│
├── [Preview / Generate PDF] button
│   → Loading indicator (PDF generating on-device)
│   → PDF preview or share sheet
│
└── [Share PDF] → system share sheet (WhatsApp, Email, Save to Files, etc.)
```

---

## 9. Profile Flow

```
Profile Screen
│
├── Top: Photo | Name | Age (auto-calculated) | Blood Group | Sex
├── [Edit Profile] button
│
├── Emergency Contacts section (list, up to 5)
│   [+ Add Contact] | Tap to edit
│
├── Conditions section (cards, swipeable)
│   [+ Add Condition] | Tap card to edit
│
├── Allergies section (tagged chips)
│   [+ Add Allergy]
│
└── Medications section (prescription cards)
    [+ Add Prescription]
    Tap prescription → expand medication items
```

---

## 10. Settings Flow

```
Settings Screen
│
├── Units
│   Temperature: °C / °F
│   Weight: kg / lbs
│   Glucose: mg/dL / mmol/L
│   Height: cm / ft+in
│
├── Defaults
│   BP Position: Sitting / Standing / Lying
│
├── Emergency
│   Emergency call number (default 112, editable)
│
├── Data
│   Manage Custom Vitals
│   [Export All Data as PDF] shortcut
│
└── About
    App version, privacy note ("All data stored locally on this device only")
```

---

## 11. Tab Bar Labels & Icons

| Tab | Icon | Label |
|---|---|---|
| Home | home-heart | Home |
| Vitals | pulse | Log |
| History | chart-bar | History |
| Profile | account-circle | Profile |
| Alerts/More | bell-outline | Alerts |
