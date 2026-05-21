# PulseSense — UI/UX Design
**Version:** 1.0

---

## 1. Design Philosophy

**Clinical but human.** PulseSense should feel trustworthy and calm — not sterile like a hospital form, not playful like a fitness app. The visual language communicates authority (for emergencies) and warmth (for daily logging).

**Key principles:**
- **Clarity over decoration** — every element has a purpose
- **Minimal scrolling** — critical info above the fold
- **Large tap targets** — emergency buttons especially must be easy to hit under stress
- **Consistent feedback** — every action has an animation response
- **Color as signal** — green/amber/red used consistently for vital status, not decoration

---

## 2. Navigation Design

**Bottom Tab Bar (5 tabs):**

```
[  🏠 Home  ] [  📊 Log  ] [  📋 History  ] [  👤 Profile  ] [  🔔 Alerts  ]
```

- Tab bar uses a light frosted-glass effect on white background
- Active tab uses primary teal with a small indicator dot above icon
- Tab labels: Home | Log | History | Profile | Alerts
- Emergency button on Home is NOT in the tab bar — it's a prominent card/button on the Home screen itself

---

## 3. Screen Designs

---

### 3.1 Splash Screen

- Full screen: Primary Teal (#1A5F7A) background
- PulseSense logo fades in + scales from 0.85 → 1.0 (spring animation, 600ms)
- Tagline fades in below logo (300ms delay): "Your personal health companion"
- Transitions out with a fade → Home or Onboarding (1.8s total)

---

### 3.2 Onboarding Screens

- Full-screen cards with dot progress indicator at bottom
- Each screen: illustration (top 45%), heading (large, bold), subtext (2–3 lines, medium weight), CTA button (bottom)
- Illustrations: simple, minimal, medical-themed line art (can use LottieFiles animations)
- Transition: horizontal slide with spring easing between screens
- Setup Profile screen: smooth form reveal with field-by-field animation (staggered entry)
- Ready screen: check mark draws itself (Lottie or SVG stroke animation)

---

### 3.3 Home Screen

**Layout (top to bottom, minimal scroll):**

```
┌────────────────────────────────────┐
│  Good morning, [Name] ·  [Date]   │  ← greeting header, small profile photo (circle, tap → profile)
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │  🚨 EMERGENCY CHECK          │  │  ← large red card, pulsing ring animation, always visible
│  │  Tap if you or someone near  │  │
│  │  you feels unwell            │  │
│  └──────────────────────────────┘  │
│                                    │
│  Latest Vitals                [→]  │  ← section header with "View All" link
│  ┌──────┐ ┌──────┐ ┌──────┐       │  ← horizontal scroll of vital summary cards
│  │  BP  │ │ SpO2 │ │Pulse │  ...  │
│  │120/80│ │ 98%  │ │ 72   │       │
│  │  ✅  │ │  ✅  │ │  ✅  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                    │
│  [+ Log a Vital]                   │  ← outlined button, full width
│                                    │
│  Recent Alerts          [View All] │
│  ┌──────────────────────────────┐  │
│  │  ⚠️ BP elevated — 03/06/2025 │  │  ← alert row card
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

**Vital summary card (horizontal scroll):**
- White card with subtle shadow
- Vital name (small, uppercase, secondary color)
- Value (large, monospaced font)
- Status badge (green dot / amber dot / red dot)
- Time since last reading (e.g. "2h ago")
- Tap → History filtered to that vital

**Emergency button animation:**
- Solid red rounded card
- Pulsing outer ring (opacity cycle 1→0.2→1, 1.5s loop) using Reanimated
- On tap: scale bounce 1→0.95→1 before navigation

---

### 3.4 Emergency Check Screen

**Layout:**

```
┌────────────────────────────────────┐
│ ← Back     Emergency Check         │
├────────────────────────────────────┤
│  What is happening?                │
│  Select all that apply             │
├────────────────────────────────────┤
│  ┌────────────────────────────┐    │
│  │  🧠 Possible Stroke         │    │  ← category card (tap to expand)
│  │  Balance · Vision · Face · │    │
│  │  Arms · Speech              │    │
│  └────────────────────────────┘    │
│  ┌────────────────────────────┐    │
│  │  ❤️ Chest Pain / Heart     │    │
│  └────────────────────────────┘    │
│  ┌────────────────────────────┐    │
│  │  🫁 Breathing / Low Oxygen │    │
│  └────────────────────────────┘    │
│  [+ more categories]               │
├────────────────────────────────────┤
│  Optional: Quick Vitals            │
│  SpO2 [ ___% ]  Pulse [ ___ bpm ]  │
├────────────────────────────────────┤
│  [  CHECK NOW  ]  ← large button   │
└────────────────────────────────────┘
```

- Category cards expand on tap to show individual symptom checkboxes
- Expand/collapse animation: smooth height change (LayoutAnimation or Reanimated)
- Checked symptoms shown with filled checkbox + teal checkmark
- Checked categories show a count badge (e.g. "3 selected")

---

### 3.5 Emergency Action Screen

**EMERGENCY_NOW state:**

```
┌────────────────────────────────────┐
│  ██████████████████████████████    │  ← full-width red banner
│  🚨 EMERGENCY ACTION REQUIRED      │
│  ██████████████████████████████    │
├────────────────────────────────────┤
│  What triggered this:              │
│  ● Face drooping detected          │
│  ● Speech difficulty detected      │
│  → Possible Stroke (B.E.F.A.S.T.) │
├────────────────────────────────────┤
│  What to do NOW:                   │
│  ① Call emergency services         │
│  ② Note the time symptoms started  │
│  ③ Do not give food or water       │
│  ④ Keep person calm and still      │
├────────────────────────────────────┤
│  ┌───────────┐  ┌───────────────┐  │
│  │ 📞 Call   │  │ 📞 Call ICE  │  │
│  │ Emergency │  │ [Contact Name]│  │
│  └───────────┘  └───────────────┘  │
│  ┌────────────────────────────┐    │
│  │ 📍 My location: [address]  │    │
│  │ [Copy Address]             │    │
│  └────────────────────────────┘    │
│                                    │
│  [Save Event to History]           │
└────────────────────────────────────┘
```

- Action step numbers have large circle indicators (animated count-up appearance)
- Call buttons are large, full-width on mobile, colored red
- Location card shows address or "Locating..." with spinner

---

### 3.6 Log Vital Screen

**Layout:**

```
┌────────────────────────────────────┐
│ ← Back         Log Vitals          │
├────────────────────────────────────┤
│  Reading taken at:                 │
│  [03/06/2025   14:32  ▼]           │  ← date/time field, editable
├────────────────────────────────────┤
│  Blood Pressure              [╳]   │  ← vital section (shown if selected)
│  Systolic   [___]  mmHg            │
│  Diastolic  [___]  mmHg            │
│  Position:  [Sitting ▼]            │
│  Status:    ● Normal               │  ← live status badge updates as user types
├────────────────────────────────────┤
│  Pain Level              [╳]       │
│  ━━━━━━━━━━━━━━━━━━━━ ⬤            │  ← slider 0–10
│  Level: 4 — Moderate               │  ← descriptor updates live
│  Location: [text field]            │
│  Notes:    [text field]            │
├────────────────────────────────────┤
│  [+ Add Another Vital]             │
├────────────────────────────────────┤
│  General Notes (optional)          │
│  [                              ]  │
├────────────────────────────────────┤
│  [     Save Reading     ]          │
└────────────────────────────────────┘
```

- Pain slider: smooth drag, label and color update as value changes
  - 0–3: green label
  - 4–6: amber label
  - 7–10: red label
- Live status badge updates as user types BP values
- Each vital section has a ╳ to remove it from the form

---

### 3.7 History Screen

```
┌────────────────────────────────────┐
│  History                           │
├────────────────────────────────────┤
│  [All Vitals ▼]  [Last 30 days ▼] │  ← filter row
├────────────────────────────────────┤
│  Date      Time   BP       SpO2   │  ← table header (sticky)
│  ──────────────────────────────── │
│  03/06/25  14:32  120/80✅  98%✅  │
│  02/06/25  09:15  135/88⚠️  97%✅  │
│  01/06/25  20:00  118/76✅  99%✅  │
│  ...                               │
├────────────────────────────────────┤
│  [Export]                          │
└────────────────────────────────────┘
```

- Table header is sticky (stays visible while scrolling)
- Status colors applied per cell
- Horizontal scroll if many columns selected
- FlatList with `getItemLayout` for performance
- Tap row → expanded detail or Vital Detail Screen

---

### 3.8 Profile Screen

```
┌────────────────────────────────────┐
│  ┌────┐  Rohan Sharma              │  ← circular photo
│  │ 📷 │  28 yrs 3 months old       │
│  └────┘  B+ | Male                 │
│           [Edit Profile]           │
├────────────────────────────────────┤
│  Emergency Contacts                │
│  ┌──────────────────────────────┐  │
│  │ 👤 Priya Sharma (Spouse) 📞  │  │  ← contact row, tap to call
│  └──────────────────────────────┘  │
│  [+ Add Contact]                   │
├────────────────────────────────────┤
│  Conditions                        │
│  ┌──────────────────────────────┐  │  ← condition card
│  │  💊 CKD Stage 5              │  │
│  │  Chronic · Since 01/2022     │  │
│  │  Severity: Severe            │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  💊 Type 2 Diabetes          │  │
│  │  Chronic · Since 06/2019     │  │
│  └──────────────────────────────┘  │
│  [+ Add Condition]                 │
├────────────────────────────────────┤
│  Allergies                         │
│  [Penicillin ⛔] [Shellfish ⚠️]   │  ← pill chips with severity color
│  [+ Add Allergy]                   │
├────────────────────────────────────┤
│  Medications                       │
│  ┌──────────────────────────────┐  │
│  │  Rx: 01/06/2025 · Dr. Mehta  │  │  ← prescription card
│  │  Metformin 500mg  1-0-1 AM   │  │
│  │  Amlodipine 5mg   0-0-1 NM   │  │
│  └──────────────────────────────┘  │
│  [+ Add Prescription]              │
└────────────────────────────────────┘
```

- Condition cards: rounded, white with teal left border, tap to expand/edit
- Allergy chips: color-coded severity (red = life-threatening, orange = severe, yellow = moderate, gray = mild)
- Medication dosage shown as M-A-N shorthand (Morning-Afternoon-Night)

---

## 4. Animations & Transitions

| Interaction | Animation |
|---|---|
| Screen push navigation | Slide from right (React Navigation default, spring) |
| Modal / bottom sheet | Slide from bottom (spring, friction 20) |
| Tab switch | Crossfade (200ms) |
| Card mount (conditions, alerts) | Fade in + translateY 12px → 0 (staggered if list) |
| Emergency button | Pulsing outer ring (opacity loop) |
| Vital status badge update | Color crossfade (200ms) |
| Pain slider | Label color/text update in real-time (no delay) |
| Log success | Card expands in, scale 0.9→1.0 + fade in |
| Onboarding screen transition | Horizontal slide + fade (spring, damping 80) |
| Splash logo | Scale 0.85→1.0 + fade in (spring) |
| Condition card expand | Animated height (LayoutAnimation.easeInEaseOut) |
| Emergency action steps | Staggered fade + slide in (50ms delay per step) |
| Number/value change | Brief scale pulse 1→1.08→1 (100ms) |
| Onboarding Ready screen | Checkmark SVG stroke draw animation |

**Libraries used:**
- `react-native-reanimated` 3 — core animation engine
- `moti` — declarative animations on top of Reanimated
- `react-native-gesture-handler` — swipe gestures on cards

---

## 5. Component Library

### Core Components

| Component | Description |
|---|---|
| `VitalCard` | Horizontal scroll card for home screen vital summary |
| `VitalStatusBadge` | Colored dot + label (Normal / High / Low / Critical) |
| `VitalInputField` | Labeled number input with unit, live status feedback |
| `PainSlider` | 0–10 slider with live descriptor label and color |
| `ConditionCard` | Tappable card with left-colored border per severity |
| `AllergyChip` | Rounded pill with severity color and delete option |
| `MedicationCard` | Prescription block with expandable medicine list |
| `DosageDisplay` | Renders `1-0-1` with M/A/N labels |
| `EmergencyButton` | Large pulsing red CTA button |
| `SeverityBanner` | Full-width colored banner for action screen |
| `ActionStep` | Numbered step with animated appearance |
| `DateTimeInput` | DD/MM/YYYY HH:MM field with auto-slash logic |
| `SectionHeader` | Section title + optional right-side action link |
| `AlertRow` | Single line alert with icon, message, timestamp |
| `TableHeader` | Sticky horizontal header row for history table |
| `TableRow` | Data row with per-cell status coloring |
| `ExportTypeCard` | Selectable card for export type picker |

---

## 6. Logo Concept

**Name:** PulseSense  
**Symbol:** A simplified ECG pulse wave integrated into a heart shape, or a clean heartbeat line with a subtle circular frame — conveys health monitoring without being too clinical.  
**Color:** Primary Teal (#1A5F7A) on white, or white on teal for dark backgrounds.  
**Typography:** "Pulse" in medium weight, "Sense" in light weight — same font (Inter), no serif.  
**Style:** Flat, single-color (works in monochrome for print/PDF watermark).

---

## 7. Accessibility Notes

- Minimum tap target: 44×44pt (Apple HIG standard)
- All interactive elements labeled with `accessibilityLabel`
- Emergency action screen uses large text (minimum 16sp body, 20sp headings)
- Color is never the only signal — icons and text always accompany status colors
- Pain slider is also keyboard/swipe accessible with large handle
