# PulseSense — Implementation Plan
**Version:** 1.0 | Build Order for V1

---

## Overview

Build order follows a **bottom-up, demo-able at each phase** strategy:
- Each phase produces a working, testable increment
- No phase depends on cloud or ML
- Emergency engine is isolated and testable independently of UI

**Estimated total:** ~8–10 weeks solo developer (part-time, alongside studies)

---

## Phase 0 — Project Setup (Week 1)

**Goal:** Working app shell, navigation, DB connected, design system in place.

### Tasks
- [ ] `npx create-expo-app pulsesense --template`
- [ ] Install all dependencies (see TRD section 1)
- [ ] Set up folder structure (see TRD section 2)
- [ ] Configure React Navigation (Stack + Bottom Tabs)
- [ ] Create `constants/colors.ts`, `typography.ts`, `spacing.ts` from UI Design Guide
- [ ] Create `src/db/schema.ts` — all CREATE TABLE statements
- [ ] Create `src/db/migrations.ts` — migration runner function
- [ ] Create `src/db/seeds.ts` — default settings seed
- [ ] Write `useDB.ts` hook: opens DB, runs migrations, returns db instance
- [ ] Verify DB initializes correctly on first launch
- [ ] Build Splash Screen with logo animation
- [ ] Build Tab Navigator shell (5 tabs, placeholder screens)
- [ ] Add `onboarding_complete` check on startup → route accordingly

**Deliverable:** App launches, shows splash, routes to either onboarding or home placeholder.

---

## Phase 1 — Onboarding + Profile (Week 2)

**Goal:** Full onboarding, profile creation, profile display screen.

### Tasks
- [ ] Build Onboarding screens (5 screens with transitions, progress dots)
- [ ] Build `DateTimeInput` component with auto-slash DD/MM/YYYY logic
- [ ] Build `calculateAge()` utility function
- [ ] Build Setup Profile form (name, DOB, sex dropdown, blood group)
- [ ] Write `profile` table queries (insert, select, update)
- [ ] On form submit: insert profile row, set `onboarding_complete = 'true'` in settings
- [ ] Build Profile Screen:
  - [ ] Photo display + `expo-image-picker` for photo selection
  - [ ] Name, age (auto-calculated), blood group, sex
  - [ ] Emergency Contacts section (list, add/edit/delete)
  - [ ] Conditions section (card per condition — add, edit, archive)
  - [ ] Allergies section (chips with severity — add, delete)
- [ ] Build all sub-screens (Add Condition, Add Allergy, Add Contact)
- [ ] Write queries for `emergency_contacts`, `conditions`, `allergies`
- [ ] Store into `profileStore` (Zustand) on app start

**Deliverable:** Complete onboarding → profile creation → profile screen with conditions as cards, allergies as chips, contacts list.

---

## Phase 2 — Medications Module (Week 3)

**Goal:** Full medication management with prescription blocks and dosage display.

### Tasks
- [ ] Build Medications Screen (list of prescription cards)
- [ ] Build Add Prescription Screen:
  - [ ] Prescription date field (DD/MM/YYYY, auto-slash)
  - [ ] Prescribing doctor field
  - [ ] Diagnosis notes field
  - [ ] Dynamic list of medication items (add/remove rows)
  - [ ] Per medicine: name, strength, dosage M/A/N toggles (0/1), timing dropdown, duration, notes
- [ ] Build `formatDosage()` utility (`1-0-1` display format)
- [ ] Write `medications` + `medication_items` table queries
- [ ] Prescription card on profile: expandable medicine list
- [ ] Active/inactive toggle per prescription

**Deliverable:** Full prescription management — add, view, expand, deactivate.

---

## Phase 3 — Vitals Logging (Week 4)

**Goal:** Full vitals logging, single or multiple, with custom time and custom vitals.

### Tasks
- [ ] Build Vital Selector Modal (bottom sheet, multi-select)
- [ ] Build Log Vital Screen:
  - [ ] Date/time field (current default, editable to past, future blocked)
  - [ ] Section per selected vital (shown only if selected)
  - [ ] BP: sys/dia + position dropdown + live status badge
  - [ ] Pulse: BPM + live status badge
  - [ ] SpO2: percentage + live status badge
  - [ ] Glucose: value + unit toggle + context dropdown
  - [ ] Temperature: value + unit toggle (C/F from settings)
  - [ ] Weight: value + unit toggle (kg/lbs from settings)
  - [ ] Pain: slider 0–10 + live descriptor + location field + pain notes
  - [ ] General notes field
- [ ] Build `PainSlider` component (color changes live: green/amber/red)
- [ ] Build `VitalStatusBadge` component (live update while typing)
- [ ] Build `unitConverter.ts` (C/F, kg/lbs, mg/dL/mmol)
- [ ] Build `vitalStatus.ts` (threshold range checker → normal/warning/danger)
- [ ] Write `vital_logs` queries (insert, select by date range, select by type)
- [ ] Build Custom Vital Definition Screen (name, unit, normal range)
- [ ] Write `custom_vital_definitions` + `custom_vital_logs` queries
- [ ] Success animation after save

**Deliverable:** Log any combination of vitals (including single vital). Live status feedback. Custom vitals working.

---

## Phase 4 — Settings (Week 4, continued)

**Goal:** User preferences that affect the whole app.

### Tasks
- [ ] Build Settings Screen (units, defaults, emergency number)
- [ ] Write `settings` queries (get, set by key)
- [ ] `settingsStore` in Zustand — loaded on startup
- [ ] Unit conversion applied at display layer throughout app (not stored)
- [ ] Manage Custom Vitals sub-screen (list, edit, deactivate)

**Deliverable:** Settings affect temperature unit display, weight unit, glucose unit, default BP position throughout the app.

---

## Phase 5 — Home Screen + Vitals History (Week 5)

**Goal:** Home screen with live vitals summary. History in tabular format.

### Tasks
- [ ] Build Home Screen:
  - [ ] Greeting header (name from profile + date)
  - [ ] Emergency button with pulsing animation (Reanimated)
  - [ ] Latest vitals horizontal scroll cards (last reading per vital type)
  - [ ] Alert banner (if unresolved EMERGENCY_NOW or URGENT_SAME_DAY alert exists)
  - [ ] Quick Log shortcut button
- [ ] Build `VitalCard` component (summary: value, status dot, time ago)
- [ ] Build History Screen:
  - [ ] Filter bar (vital type dropdown + date range picker)
  - [ ] Tabular display with sticky header (FlatList + getItemLayout)
  - [ ] Color-coded cells by threshold status
  - [ ] Horizontal scroll for multiple vital columns
  - [ ] Tap row → expanded view or Vital Detail Screen
- [ ] Build Vital Detail Screen:
  - [ ] Sparkline/chart (last 14 readings) using react-native-gifted-charts
  - [ ] Table of all readings for that vital

**Deliverable:** Home shows live latest vitals. History is filterable tabular format, color-coded.

---

## Phase 6 — Emergency Rule Engine + Emergency Screens (Week 6)

**Goal:** Complete emergency check flow with rule engine, action screen, and alert persistence.

### Tasks
- [ ] Write `ruleEngine.ts` — full rule evaluation function (all 7 pathways)
- [ ] Write `RULES` constant array in `constants/rules.ts`
- [ ] Build Emergency Check Screen:
  - [ ] Category cards (expandable on tap)
  - [ ] Symptom checkboxes per category
  - [ ] Optional quick vitals entry (SpO2, Pulse, BP)
  - [ ] [Check Now] button
- [ ] Build Emergency Action Screen:
  - [ ] Severity banner (color by severity level)
  - [ ] Triggered-by list
  - [ ] Action steps (staggered animation on mount)
  - [ ] Emergency call button (expo-linking tel:)
  - [ ] ICE contact button (primary emergency contact)
  - [ ] Location display (expo-location + address lookup)
  - [ ] [Save Event] button → insert symptom_event + rule_triggers
- [ ] Alert generation on vital save (threshold breach → insert alert)
- [ ] Build Alerts Screen (history of all alerts, resolved/unresolved)
- [ ] Alert banner on Home (if unresolved critical alert exists)

**Deliverable:** Full emergency flow end-to-end. Rule engine fires correctly. Alerts persist and show on home screen.

---

## Phase 7 — PDF Export (Week 7)

**Goal:** All export types working, lab-report PDF quality.

### Tasks
- [ ] Install and configure `expo-print` + `expo-sharing` + `expo-file-system`
- [ ] Build `pdfTemplates.ts` — HTML/CSS string builders for each export type:
  - [ ] `buildMedicalIdHtml()`
  - [ ] `buildVitalsReportHtml(vitals, dateRange, selectedTypes)`
  - [ ] `buildMedicationsHtml(medications)`
  - [ ] `buildAlertsHtml(alerts)`
  - [ ] `buildFullReportHtml()` — combines all above
- [ ] Build `exportService.ts` — orchestrates data fetch + template + print + share + cleanup
- [ ] Build Export Screen:
  - [ ] Export type checkboxes
  - [ ] Vital type multi-select (if Vitals Report selected)
  - [ ] Date range picker
  - [ ] [Generate PDF] → loading indicator → share sheet
- [ ] Add [Export] button to History Screen (pre-filtered)
- [ ] Add [Export Medical ID] shortcut in Profile

**Deliverable:** All 5 export types produce lab-report quality PDFs, shareable via system share sheet.

---

## Phase 8 — Polish, Animations, Edge Cases (Week 8)

**Goal:** Production-quality feel. All animations, transitions, empty states, edge cases.

### Tasks
- [ ] Add all animations (see UI-UX Design section 4)
- [ ] Add empty states for all screens (no vitals, no conditions, no alerts, etc.)
- [ ] Add form validation error states (required fields, invalid date, future date block)
- [ ] Add loading states (PDF generation, location fetch)
- [ ] Handle no-location-permission gracefully on emergency screen
- [ ] Add "About" section in Settings with privacy note
- [ ] Review all screens for:
  - [ ] Scroll not required for primary content
  - [ ] Large enough tap targets (44×44 minimum)
  - [ ] Consistent spacing using design tokens
- [ ] Test on both iOS and Android (Expo Go or simulator)
- [ ] Test offline: disconnect wifi/data, verify all features still work
- [ ] Test edge cases: no emergency contacts (hide ICE button gracefully), no vitals logged (empty history), very long condition names
- [ ] Profile photo: handle no photo state (initials avatar fallback)

**Deliverable:** Polished, demo-ready V1 app.

---

## Phase 9 — Play Store / App Store Prep (Post-V1)

- [ ] Create app icon (1024×1024) and adaptive icon
- [ ] Create splash image
- [ ] Write app store description emphasizing differentiation (local-first, offline, rule-based triage, not a diagnosis tool)
- [ ] `eas build` for APK/IPA
- [ ] Internal testing via TestFlight (iOS) or internal track (Android)
- [ ] Add disclaimer: "PulseSense provides general health guidance and emergency checklists. It does not diagnose medical conditions. Always consult a qualified healthcare professional."

---

## Dependency Install Reference

```bash
npx create-expo-app pulsesense

npx expo install expo-sqlite
npx expo install expo-image-picker
npx expo install expo-location
npx expo install expo-linking
npx expo install expo-print
npx expo install expo-sharing
npx expo install expo-file-system

npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

npm install react-native-reanimated
npm install moti
npm install react-native-gesture-handler

npm install zustand
npm install react-hook-form
npm install date-fns

npm install react-native-gifted-charts  # or victory-native
npm install @expo-google-fonts/inter
npm install @expo-google-fonts/roboto-mono
npm install @expo/vector-icons  # already in Expo
```

---

## Key Milestones Summary

| Milestone | End of Phase | Testable Feature |
|---|---|---|
| M1 | Phase 0 | App launches, DB ready, routing works |
| M2 | Phase 1 | Onboarding complete, profile with conditions as cards |
| M3 | Phase 2 | Medications with dosage M-A-N format |
| M4 | Phase 3–4 | Single vital logging, custom vitals, settings |
| M5 | Phase 5 | Home screen with live vitals, history table |
| M6 | Phase 6 | Emergency engine end-to-end, alerts |
| M7 | Phase 7 | PDF export, all export types |
| M8 | Phase 8 | Polished, demo-ready V1 |
