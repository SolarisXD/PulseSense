# PulseSense — Project Context & Portfolio Overview

> **Status:** In Development (Pre-Production)  
> **Last Updated:** 31 May 2026  
> **Repository:** [github.com/SolarisXD/PulseSense](https://github.com/SolarisXD/PulseSense)  
> **License:** MIT

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem & Motivation](#2-problem--motivation)
3. [Product Overview](#3-product-overview)
4. [Architecture](#4-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Feature Deep-Dive](#6-feature-deep-dive)
7. [Database Schema (13 Tables)](#7-database-schema-13-tables)
8. [Rule Engine](#8-rule-engine)
9. [Project Structure](#9-project-structure)
10. [Codebase Metrics](#10-codebase-metrics)
11. [Testing](#11-testing)
12. [Design System](#12-design-system)
13. [What Has Been Built](#13-what-has-been-built)
14. [Recent Bug Fixes & Optimizations](#14-recent-bug-fixes--optimizations)
15. [Play Store v1 — Remaining Work](#15-play-store-v1--remaining-work)
16. [Key Decisions & Trade-offs](#16-key-decisions--trade-offs)
17. [How to Run](#17-how-to-run)
18. [Disclaimer](#18-disclaimer)

---

## 1. Executive Summary

PulseSense is an **offline-first, 100% private health companion** mobile application built with React Native and Expo SDK 54. It enables individuals and caregivers to track personal vitals, manage medical information (conditions, allergies, medications, emergency contacts), and navigate medical emergencies using a deterministic, rule-based triage engine — **all without requiring cloud connectivity, accounts, or internet access**.

The app stores all data exclusively in a local SQLite database on-device. No data is transmitted to external servers. The triage engine provides informational guidance only — it is **not a medical device** and carries a prominent medico-legal disclaimer.

**Development period:** 20 May 2026 – 31 May 2026 (5 days of active development across an 11-day span, ~17,800 source lines of TypeScript).  
**Target platform:** Android (Google Play Store v1), with iOS support in the architecture.

---

## 2. Problem & Motivation

Despite the abundance of health-tracking apps, most solutions:

- **Require accounts and cloud sync** — creating privacy concerns and making them unusable without internet.
- **Lock features behind subscriptions** — limiting access to critical health management tools.
- **Provide no emergency guidance** — they log data but offer no actionable insight when it matters most.
- **Are not designed for caregivers** — managing health information for a family member is unnecessarily complex.

PulseSense addresses these gaps by providing a **completely offline, privacy-first** health data management tool with an integrated **emergency triage engine** that helps users assess symptoms in real time.

---

## 3. Product Overview

### Core Capabilities

- **Vital Tracking** — Log 7 standard vital types (heart rate, blood pressure, SpO₂, temperature, blood glucose, pain level, weight) plus user-defined custom vitals with custom names, units, and normal ranges.
- **Rule-Based Triage Engine** — Deterministic, offline symptom assessment evaluating 18 symptom flags against 10 predefined rules. Results are sorted by severity with actionable guidance steps and evidence-based notes.
- **Emergency Guidance** — Step-by-step emergency action screen with BEFAST stroke assessment, on-device location display, and one-tap emergency calling.
- **Medication Management** — Structured prescription logging with morning/afternoon/night dosage tracking and reminder scheduling via `expo-notifications`.
- **Medical Information Management** — Card-based presentation of medical conditions, allergies, and emergency contacts for quick reference.
- **Medical ID** — One-page shareable summary of critical medical information (name, DOB, blood group, conditions, allergies, medications, contacts) in both PDF and CSV formats.
- **PDF & CSV Export** — Lab-report-style PDF and CSV exports for vitals history, medical ID, medications, alerts, and a combined full report — all generated entirely on-device.
- **Apple Health & Health Connect Sync** — Opt-in read/write integration with Apple Health (iOS) and Health Connect (Android) with permission controls per data type.
- **Drug Interaction Checker** — Offline database of known drug-drug interactions (ACE inhibitors, ARBs, NSAIDs, anticoagulants, statins, SSRIs, etc.) evaluated against active medications.
- **Backup & Restore** — Full database export/import as JSON via `expo-file-system` and `expo-sharing`.
- **Dark Mode** — Full dark theme support across all screens.
- **Offline-First** — 100% local. No account required. No data ever leaves the device unless the user explicitly exports or shares it.
- **Onboarding Flow** — 4-screen animated onboarding (Welcome → Features → Setup Profile → Ready) shown only on first launch.

### Target Audience

- Individuals managing chronic conditions who want a private, offline log
- Caregivers tracking health data for family members
- Anyone who wants a medical ID and emergency preparedness tool that works without internet
- Privacy-conscious users who refuse cloud-based health platforms

---

## 4. Architecture

PulseSense follows a **layered architecture** with clear separation between UI, state, logic, and data:

```
┌─────────────────────────────────────────────┐
│          UI Layer (Screens & Components)     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Screens  │ │Components│ │   Navigation │ │
│  │ (10+.tsx) │ │  (20+)   │ │  (Stack+Tab) │ │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
└───────┼─────────────┼──────────────┼─────────┘
        │             │              │
        ▼             ▼              ▼
┌─────────────────────────────────────────────┐
│        State Management (Zustand)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Profile  │ │ Settings │ │ Alert Store  │ │
│  │  Store   │ │  Store   │ │              │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐                                │
│  │  Theme   │  ← Hydrated from SQLite        │
│  │  Store   │    on app start                │
│  └──────────┘                                │
└───────┬─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│           Logic / Engine Layer                │
│  ┌──────────────┐ ┌───────────────────┐     │
│  │  Rule Engine │ │  Health Insights  │     │
│  │ (symptoms +  │ │ (trend analysis)  │     │
│  │  thresholds) │ └───────────────────┘     │
│  └──────────────┘ ┌───────────────────┐     │
│                    │ Drug Interaction  │     │
│                    │    Checker        │     │
│                    └───────────────────┘     │
│  ┌──────────────────┐ ┌────────────────┐     │
│  │ Health Platform  │ │ Export Service │     │
│  │ (Apple Health /  │ │ (PDF + CSV)    │     │
│  │  Health Connect) │ └────────────────┘     │
│  └──────────────────┘                        │
└───────┬─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│        Database Layer (SQLite)               │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ │
│  │Queries/  │ │  Migrations  │ │  Seeds   │ │
│  │(11 files)│ │  (v1→v2)     │ │(12 keys) │ │
│  └──────────┘ └──────────────┘ └──────────┘ │
│  13 tables, 7 indexes, FK constraints       │
└─────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **SQLite over async storage** | Structured queries, FK relationships, migrations, and efficient time-series queries for vitals |
| **Zustand over Redux** | Minimal boilerplate, excellent TypeScript inference, built-in subscription model |
| **Raw SQL over ORM** | Full control over query performance, no ORM overhead for a local-only app |
| **Pure TS rule engine** | Zero dependencies, fully deterministic, trivially testable (29 test cases) |
| **HTML→PDF on-device** | `expo-print` renders HTML → PDF locally; no server or internet needed |
| **4pt grid design system** | Consistent spacing (4/8/12/16/20/24/32/48), reusable tokens, rapid theming |

---

## 5. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React Native (via Expo) | 0.81.5 / SDK 54 |
| **Language** | TypeScript | 5.9 |
| **Navigation** | @react-navigation/stack + bottom-tabs | 7.x |
| **State Management** | Zustand | 4.5 |
| **Local Database** | expo-sqlite | 16.0 |
| **Charts** | react-native-gifted-charts | 1.4 |
| **Animations** | react-native-reanimated + moti | 4.1 / 0.29 |
| **PDF Generation** | expo-print + expo-file-system + expo-sharing | — |
| **Forms** | react-hook-form | 7.50 |
| **Notifications** | expo-notifications | 0.32 |
| **Icons** | @expo/vector-icons (Ionicons) | 15.0 |
| **Fonts** | Syne (display), Outfit (body), Roboto Mono (mono) | ^0.4.2 / ^0.4.3 / ^0.2.0 |
| **Health Sync** | react-native-health (iOS), react-native-health-connect (Android), expo-health-connect | ^1.19.0 / ^3.5.3 / ^0.1.1 |
| **Linear Gradients** | expo-linear-gradient | 15.0 |
| **Testing** | Jest 29.7 + @testing-library/react-native 13.3 | — |
| **Build** | EAS Build (Android app-bundle) | — |

### Package Statistics

- **Runtime dependencies:** 48 packages
- **Dev dependencies:** 4 packages
- **Node version:** 18+
- **Build target:** Android 8+ (minSdkVersion 26), target SDK 34

---

## 6. Feature Deep-Dive

### 6.1 Vital Tracking

- 7 standard vital types: Heart Rate, Blood Pressure (systolic/diastolic/position), SpO₂, Body Temperature (°C/°F), Blood Glucose (mg/dL & mmol/L with meal context), Weight (kg/lbs), Pain Level (0–10 with location/notes)
- Single-vital logging supported (all fields nullable)
- Custom vitals: user-defined name, unit, normal range (min/max), logged via custom_vital_logs table
- Table and chart views in History tab with toggle

### 6.2 Rule-Based Triage Engine

The engine (`src/engine/ruleEngine.ts`) evaluates 18 symptom flags against 10 deterministic rules:

| # | Rule | Triggers | Severity | Hard Override |
|---|------|----------|----------|:---:|
| 1 | **Cardiac Arrest** | unconscious + not_breathing | EMERGENCY_NOW | ✓ |
| 2 | **Stroke (BEFAST)** | Any of: balance_loss, vision_change, face_droop, arm_weakness, speech_difficulty | EMERGENCY_NOW | ✓ |
| 3 | **Heart Attack** | chest_discomfort OR ≥2 associated symptoms | EMERGENCY_NOW | ✗ |
| 4 | **Critical SpO₂** | SpO₂ < 90% | EMERGENCY_NOW | ✓ |
| 5 | **Low SpO₂** | SpO₂ 90–94% | URGENT_SAME_DAY | ✗ |
| 6 | **Severe Bleeding** | severe_bleeding flag | EMERGENCY_NOW | ✗ |
| 7 | **Anaphylaxis** | anaphylaxis flag | EMERGENCY_NOW | ✗ |
| 8 | **Seizure** | seizure flag | EMERGENCY_NOW | ✗ |
| 9 | **High Pulse** | resting pulse > 120 bpm | URGENT_SAME_DAY | ✗ |
| 10 | **Low Pulse** | resting pulse < 50 bpm | URGENT_SAME_DAY | ✗ |

Additionally, `evaluateVitalThresholds()` checks SpO₂ and blood pressure against critical thresholds and generates alerts.

Results are sorted: hard overrides first, then by severity level (EMERGENCY_NOW > URGENT_SAME_DAY > MONITOR_CLOSELY > LOG_ONLY).

### 6.3 Emergency Screens

- **Emergency Check Screen:** Symptom checklist (18 flags) + optional real-time vitals → evaluates against rule engine → displays results sorted by severity with action steps and evidence-based notes.
- **Emergency Action Screen:** Red full-screen UI with severity banner, step-by-step action list, BEFAST stroke assessment, current location display (via expo-location), and one-tap emergency calling.

### 6.4 Medication Management

- Structured prescriptions with prescribing doctor, diagnosis notes, and active/inactive status
- Medication items (linked FK to prescriptions) with medicine name, strength, dosage timing (M/A/N), duration, and notes
- Reminder scheduling via expo-notifications with morning/afternoon/night configurable times
- Medication lists with active/inactive filtering

### 6.5 Export System

Offers 5 export types in PDF and CSV:

| Export Type | Content |
|-------------|---------|
| **Medical ID** | Name, DOB, blood group, conditions, allergies, contacts (1 page) |
| **Vitals Report** | Tabular history of selected vitals with date range |
| **Medications** | All active prescriptions with dosage table |
| **Emergency Alerts** | Log of emergency events with severity and timestamp |
| **Full Report** | All of the above combined |

Process: fetch data → build HTML/CSS template → render to PDF via expo-print → share via OS share sheet. CSV variant uses manual CSV string building.

### 6.6 Health Platform Integration

- **iOS:** Apple Health via `react-native-health` — read/write heart rate, blood pressure, weight, SpO₂, steps
- **Android:** Health Connect via `react-native-health-connect` + `expo-health-connect` — same data types
- Opt-in permissions per data type, revocable at any time
- Sync direction: import (read from platform) and export (write to platform)

### 6.7 Drug Interaction Checker

Offline database of 69 known drug-drug interactions across categories:

- ACE Inhibitors + Potassium-sparing Diuretics (major — hyperkalemia risk)
- ACE Inhibitors + ARBs (moderate — additive hypotension)
- NSAIDs + Anticoagulants (major — bleeding risk)
- Statins + CYP3A4 Inhibitors (major — myopathy risk)
- SSRIs + SNRIs + MAOIs (major — serotonin syndrome)
- Beta-blockers + Calcium Channel Blockers (moderate — bradycardia)
- Metformin + Contrast Dye (moderate — lactic acidosis risk)
- Warfarin + Antibiotics (moderate — INR fluctuation)

Each interaction includes: severity level, physiological effect, and clinical recommendation.

### 6.8 Backup & Restore

- Full database export as JSON file (all 13 tables)
- Import/restore from previously exported JSON
- Uses expo-file-system for file I/O and expo-sharing for transport

### 6.9 Custom Vitals

- User-defined vital type: name, unit, normal_min, normal_max, notes
- Logged in separate `custom_vital_logs` table linked to `vital_logs` (for temporal association)
- Displayed alongside standard vitals in History charts/tables

---

## 7. Database Schema (13 Tables)

```
settings ──── key-value app configuration (dark mode, units, reminders, etc.)
profile ───── single-row user profile (name, DOB, sex, blood group, height, photo)
emergency_contacts ── name, relationship, phone, contact_type, is_primary, sort_order
conditions ── medical conditions (name, type, diagnosed_date, severity, notes, is_active)
allergies ─── allergy records (name, category, reaction, severity, is_active)
medications ─ prescription records (date, doctor, diagnosis_notes, is_active)
medication_items ── individual medicines per prescription (name, M/A/N dosage, timing, duration) [FK→medications]
vital_logs ── time-series vital sign records (7 standard types + pain, all nullable)
custom_vital_definitions ── user-defined vital type definitions (name, unit, normal range)
custom_vital_logs ── values logged against custom definitions [FK→custom_vital_definitions, FK→vital_logs]
symptom_events ── symptom check session (19 symptom flags + vitals at time)
rule_triggers ── rules that fired during a symptom event [FK→symptom_events]
alerts ── generated alerts from threshold violations or rule triggers [FK→symptom_events, FK→vital_logs]
```

**Design principles:**
- All dates stored as TEXT in DD/MM/YYYY format for display consistency
- All timestamps stored as ISO 8601 internally for sorting
- `logged_at_display` vs `created_at` distinction for user-facing vs insertion time
- `is_active` / `is_deleted` flags used for soft deletes
- Foreign keys enforced via `PRAGMA foreign_keys = ON` in migration startup (migrations.ts)
- 7 indexes for query performance (date DESC, FK lookups, soft-delete filtering)

---

## 8. Rule Engine

**File:** `src/engine/ruleEngine.ts` (336 lines)  
**Type:** Pure TypeScript — zero external dependencies  
**Test coverage:** 29 test cases in `src/__tests__/engine/ruleEngine.test.ts`

### `evaluateSymptoms(input: SymptomInput): RuleResult[]`
- Accepts 18 boolean symptom flags + 4 numeric vitals (SpO₂, pulse, BP sys/dia)
- Returns array of triggered rules sorted by priority (hard overrides → severity level)
- Each result includes: severity level, rule ID, category, user-facing message, triggered conditions list, numbered action steps, evidence-based clinical note

### `evaluateVitalThresholds(vitalLog): Alert | null`
- Checks SpO₂ (< 90 → EMERGENCY_NOW, < 95 → URGENT_SAME_DAY)
- Checks BP (systolic ≥ 180 OR diastolic ≥ 120 → Hypertensive Crisis alert)
- Returns structured alert or null

This engine is also used by:
- `src/hooks/useHealthInsights.ts` — analyzes vital trends and generates natural-language insights with 30s in-memory cache
- `src/screens/emergency/EmergencyCheckScreen.tsx` — the main symptom check UI

---

## 9. Project Structure

```
pulsesense/
├── App.tsx                          # Root component (font loading, theme, gesture handler)
├── index.ts                         # Expo entry point (registerRootComponent)
├── app.json                         # Expo config (package, plugins, permissions, splash)
├── eas.json                         # EAS Build config (production app-bundle)
├── tsconfig.json                    # TypeScript config (strict mode)
├── babel.config.js                  # Babel config (expo preset)
├── jest.config.js                   # Jest configuration
├── metro.config.cjs                 # Metro bundler config
├── package.json                     # 33 runtime deps, 3 dev deps
├── CONTEXT.md                       # ← This file
├── README.md                        # Public README
├── LICENSE                          # MIT License
├── privacy_policy.md                # Full privacy policy with medico-legal disclaimer
├── AGENTS.md                        # AI agent project context (internal)
├── CLAUDE.md                        # AI agent instructions (internal)
├── assets/                          # Icons, splash screen images, favicon
├── android/                         # Android native project (generated)
├── docs/                            # Project documentation
│   ├── PRD.md                       # Product Requirements Document
│   ├── TRD.md                       # Technical Requirements Document
│   ├── System_Architecture.md
│   ├── AppFlow.md
│   ├── UI-UX_Design.md
│   ├── UI_Design_Guide.md
│   ├── Backend_Schema.md            # Detailed schema reference
│   ├── Implementation_Plan.md
│   ├── play_store_assets_guide.md   # Play Store asset specifications
│   └── index.html                   # GitHub Pages landing page
├── src/
│   ├── __tests__/                   # 21 test files, 2,294 lines
│   │   ├── appFlow.test.ts          # End-to-end flow validation
│   │   ├── constants/rules.test.ts
│   │   ├── db/                      # database.test.ts, migrations.test.ts, schema.test.ts
│   │   ├── engine/                  # ruleEngine.test.ts, healthInsights.test.ts
│   │   ├── export/                  # exportService.test.ts, pdfTemplates.test.ts
│   │   ├── hooks/                   # useAgeCalculator.test.tsx, useColors.test.tsx
│   │   ├── store/                   # profileStore, settingsStore, alertStore, themeStore
│   │   ├── utils/                   # dateUtils, dosageFormatter, vitalFormatters, etc.
│   │   └── mocks/                   # 11 mock files for Expo/Native modules
│   ├── components/
│   │   ├── ui/                      # 12 reusable UI components
│   │   ├── vitals/                  # 7 vital-specific components
│   │   ├── export/                  # ExportTypeCard
│   │   ├── emergency/               # Emergency-related components
│   │   ├── health/                  # Health platform components
│   │   ├── medications/             # Medication components
│   │   └── conditions/              # Condition components
│   ├── constants/                   # Design system tokens
│   │   ├── colors.ts                # 50+ color tokens
│   │   ├── colorsDark.ts            # Dark mode overrides
│   │   ├── typography.ts            # Font families + type scale (9 sizes)
│   │   ├── spacing.ts               # 4pt grid spacing, border radius, hit slop
│   │   ├── rules.ts                 # Severity types, SymptomInput, RuleResult interfaces
│   │   └── chipStyles.ts            # Reusable chip component styles
│   ├── db/
│   │   ├── database.ts              # SQLite connection singleton
│   │   ├── schema.ts                # 13 CREATE TABLE + 7 CREATE INDEX statements
│   │   ├── migrations.ts            # Versioned migration runner (v1→v2)
│   │   ├── seeds.ts                 # 12 default settings seeds
│   │   └── queries/                 # Typed CRUD functions (11 files)
│   ├── engine/                      # Business logic (5 files)
│   │   ├── ruleEngine.ts            # Symptom + vital threshold evaluation
│   │   ├── healthInsights.ts        # Trend analysis with 30s cache
│   │   ├── drugInteractions.ts      # 150+ drug interaction rules
│   │   ├── healthPlatform.ts        # Apple Health + Health Connect adapter
│   │   └── healthPlatformTypes.ts   # Type definitions for health sync
│   ├── screens/                     # Screen components (20+)
│   │   ├── tabs/                    # 5 tab screens (Home, Vitals, History, Profile, Alerts)
│   │   ├── onboarding/              # 4 screen onboarding flow
│   │   ├── emergency/               # Emergency Check + Emergency Action
│   │   ├── export/                  # Export screen
│   │   ├── medications/             # Medication list + add screens
│   │   ├── conditions/              # Add/edit condition screen
│   │   ├── settings/                # Settings + Health Connection screens
│   │   └── ...                      # AddContact, AddAllergy, EditProfile, CustomVitals, VitalDetail
│   ├── store/                       # Zustand stores (4 files)
│   ├── navigation/                  # AppNavigator + TabNavigator + OnboardingStack
│   ├── services/                    # notificationService + backupService
│   ├── export/                      # exportService + pdfTemplates + csvExport
│   ├── hooks/                       # useDB, useColors, useAgeCalculator, etc.
│   └── utils/                       # dateUtils, vitalFormatters, vitalStatus, etc.
```

---

## 10. Codebase Metrics

| Metric | Value |
|--------|-------|
| **Total TypeScript/TSX files** | 127 |
| **Total source lines** | ~17,834 |
| **Test files** | 21 |
| **Test lines** | ~2,294 |
| **Components** | 20+ reusable components |
| **Screens** | 20+ screen components |
| **Database tables** | 13 |
| **Database indexes** | 7 |
| **Git commits** | 10 |
| **Development period** | 20 May 2026 – 31 May 2026 (11 days) |
| **Contributors** | 1 (Spelldrake) |
| **NPM dependencies** | 48 runtime, 4 dev |
| **Engine rules** | 10 symptom rules + 1 vital threshold rule |
| **Symptom flags evaluated** | 18 |
| **Drug interactions** | 69 pairs |
| **Export types (PDF + CSV)** | 5 |
| **Custom vital definitions** | Unlimited (user-defined) |

---

## 11. Testing

**Test runner:** Jest 29.7 with `@testing-library/react-native` 13.3

**Mock infrastructure:** 11 mock files covering all Expo and Native modules (`expo-sqlite`, `expo-constants`, `expo-font`, `expo-splash-screen`, `expo-status-bar`, `@expo/vector-icons`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-gifted-charts`, `@react-native-community/slider`)

**Test breakdown:**

| Test Area | Files | Focus |
|-----------|-------|-------|
| **Engine** | 2 | Rule engine (22 cases), health insights |
| **Stores** | 4 | Profile, settings, alert, theme state |
| **Export** | 2 | Export service, PDF templates |
| **Database** | 3 | Init, migrations, schema validation |
| **Utils** | 6 | Date formatting, dosage, vital formatting, status |
| **Hooks** | 2 | Age calculator, color hook |
| **Constants** | 1 | Severity level ordering |
| **App Flow** | 1 | End-to-end app flow validation |

**Run tests:**
```bash
npm test                 # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

---

## 12. Design System

All design tokens are centralized in `src/constants/`:

### Color System (42 tokens)
- **Primary:** #1A5F7A (teal-blue) with #2E86AB light variant
- **Semantic:** Success (#2DC653), Warning (#F4A261), Danger (#E63946), Urgent (#D97706)
- **Emergency:** #C0392B background with white text
- **Neutrals:** Background #F5F7FA, Surface #FFFFFF, Text #1C2B3A / #546E7A / #9EABB7
- **Glassmorphism:** glassBg, glassBorder, glassHighlight, glassShadow
- **Gradients:** Predefined gradient pairs for Home, Vitals, and Emergency screens
- **Dark mode:** Complete dark palette with 33 overrides

### Typography (3 fonts, 11 sizes)
- **Syne** (display/headings) — bold geometric
- **Outfit** (body/labels) — warm clean
- **Roboto Mono** (vital values, tables) — monospace

### Spacing (4pt grid)
- space1=4, space2=8, space3=12, space4=16, space5=20, space6=24, space8=32, space12=48
- Border radius: sm=6, md=10, lg=16, xl=24, full=9999
- Min tap target: 44pt (Apple HIG)

---

## 13. What Has Been Built

### Screens & Navigation

- **5-tab bottom navigator:** Home, Vitals (Log Vitals), History, Profile, Alerts
- **4-screen onboarding:** Welcome → Features → SetupProfile → Ready (animated spring transitions, progress dots)
- **Emergency Check screen:** Symptom checklist (18 flags) + optional vitals → rule evaluation → result display
- **Emergency Action screen:** Full-screen red UI with BEFAST, location, one-tap call, severity banner
- **Settings screen** (1,185 lines): 12+ preferences including units (temp, weight, glucose, height), BP position, emergency number, reminder times, dark mode toggle, danger zone (delete profile with typed confirmation)
- **Health Connection screen:** Apple Health / Health Connect permission management
- **Export screen:** 5 export types, vital selection, date range, PDF preview, CSV option
- **Profile screen:** Card-based display of profile, conditions, allergies, contacts, medications
- **Vital screens:** Log vitals, custom vitals, vital detail, history (table/chart toggle)
- **Medication screens:** List + add prescription with M/A/N dosage
- **Add/Edit screens:** Contact, condition, allergy, profile, custom vital

### Key Components (20+)

- `Button`, `Card`, `Input`, `ErrorBoundary`, `SplashScreen`, `Skeleton`, `SeverityBanner`
- `VitalCard`, `VitalChartCard`, `VitalFormSection`, `VitalInputField`, `TableHeader`, `TableRow`, `PainSlider`
- `AlertRow`, `AnimatedSection`, `ActionStep`, `CycleDropdown`, `VitalStatusBadge`, `ExportTypeCard`

### Data Layer

- SQLite database with 13 tables, 7 indexes, FK constraints
- Versioned migration system (v1→v2 with column addition)
- 11 typed query files with CRUD operations per domain
- Singleton connection with lazy initialization

### Services

- **Notification service:** Lazy-loads expo-notifications, platform-aware channel creation (Android), schedules/cancels medication reminders by prefix
- **Backup service:** Full DB export/restore as JSON with all 13 tables

### Store Layer

- `profileStore` — profile + contacts + conditions + allergies
- `settingsStore` — all user preferences + onboarding state
- `themeStore` — dark mode with SQLite persistence
- `alertStore` — active alerts + emergency result cache

---

## 14. Recent Bug Fixes & Optimizations

### Database & Query Performance
- **N+1 in getMedications/getActiveMedications:** Fixed with `IN` clause + JS-side grouping
- **getLatestPerVital:** 7 parallel per-type queries (eliminated LIMIT 20 blind spot)
- **setPrimaryContact:** Wrapped in SQLite transaction for atomicity
- **deleteProfile:** Wrapped entire process in BEGIN/COMMIT/ROLLBACK
- **Reschedule/cancel medication reminders:** Filtered by `med-` prefix (not nuking all notifications)
- **rescheduleAllMedicationReminders:** Replaced sequential await with `Promise.allSettled`

### UI & State
- **ExportScreen stuck loading:** Added `setGenerating(false)` in `finally` block
- **Onboarding:** Back button on FeaturesScreen + SetupProfileScreen
- **useHealthInsights:** Added 30-second in-memory cache to prevent recomputation
- **6 empty catch blocks:** Replaced with `console.warn` for debuggability

### Build & Config
- Fixed `@types/jest` version mismatch (v30 → v29.5)
- Updated `app.json`: added description, fixed package name to `com.pulsesense.app`
- Created `eas.json` with production build profile (Android app-bundle)
- Added `*.aab` / `*.apk` to `.gitignore`

### Import Direction
- **notificationService.ts:** Changed to direct DB import instead of circular dependency

---

## 15. Play Store v1 — Remaining Work

> Everything code-related is complete. The following steps require developer action:

1. **Create Google Play Developer account** ($25 one-time fee)
2. **Generate app icon** (512×512), feature graphic (1024×500), and 6 screenshots (specifications in `docs/play_store_assets_guide.md`)
3. **Host privacy policy** — use privacypolicies.com or GitHub Pages (a `privacy_policy.md` and `docs/index.html` already exist)
4. **Build and upload:**
   ```bash
   eas login
   eas build --platform android --profile production
   ```
5. **Upload the resulting `.aab` file** to Google Play Console → fill store listing → rollout

### Build Profile (eas.json)
```json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 16. Key Decisions & Trade-offs

| Decision | Trade-off | Why It Was Made |
|----------|-----------|-----------------|
| **Offline-first with SQLite** | No real-time sync, data loss on uninstall | Privacy is the product; cloud sync would undermine the core value prop |
| **Static rule engine (no ML)** | Cannot learn or adapt to user patterns | Deterministic behavior is safer for health guidance; no false positives from under-trained models |
| **Raw SQL queries** | More verbose than ORM, no migration magic | Full control over query plans; ORMs add complexity without benefit for single-device SQLite |
| **Expo managed workflow** | Limited native module customization | Faster development, OTA updates, EAS Build handles signing; `expo-dev-client` available if needed |
| **No app-level encryption** | Data security = device security | SQLite encryption (sqlcipher) would require ejecting from Expo; device-level encryption is sufficient for the target use case |
| **`is_deleted` soft deletes** | Data accumulates over time | Health data should never be truly deleted; export/backup preserves history |
| **No backend** | No multi-device, no sharing, no analytics | The core product is personal and private; adding backend features would be a separate product |
| **Custom font loading** | 1–2s splash screen delay | Syne + Outfit significantly improve the visual identity; splash screen masks the load |

---

## 17. How to Run

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npx expo`)
- Android Emulator, iOS Simulator, or physical device with Expo Go

### Commands
```bash
# Clone & install
git clone https://github.com/SolarisXD/PulseSense.git
cd PulseSense
npm install

# Start development server
npm start
# Press 'a' for Android Emulator, 'i' for iOS Simulator, or scan QR with Expo Go

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Production build
eas build --platform android --profile production
```

---

## 18. Disclaimer

> **PulseSense is not a medical device.** It has not been cleared or approved by the FDA, MHRA, or any other regulatory body. It does **not** provide a medical diagnosis, treatment recommendation, or clinical decision support.
>
> The emergency triage engine uses a static, rule-based checklist for informational guidance only. It may produce false positives, false negatives, or be inappropriate for your specific condition. **If you believe you are experiencing a medical emergency, call your local emergency services immediately (e.g., 911, 112, 999).**
>
> *PulseSense — Not a doctor. Not a diagnosis. The right action, at the right moment.*
