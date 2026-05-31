# PulseSense — UI Design Guide
**Version:** 1.0 | Design System Reference

---

## 1. Color Palette

### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1A5F7A` | Primary buttons, active tab, section headers, card accents |
| `primary-light` | `#2E86AB` | Hover states, secondary interactive elements |
| `primary-surface` | `#E0F2F8` | Light teal background for chips, tags, teal-tinted cards |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `success` | `#2DC653` | Normal vital status, positive indicators |
| `success-surface` | `#D1FAE5` | Success badge background |
| `warning` | `#F4A261` | Borderline vitals, caution states |
| `warning-surface` | `#FEF3C7` | Warning badge background |
| `danger` | `#E63946` | Emergency alerts, critical vitals, emergency button |
| `danger-surface` | `#FEE2E2` | Danger badge background |
| `urgent` | `#D97706` | URGENT_SAME_DAY severity color (darker amber) |

### Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| `background` | `#F5F7FA` | Screen background |
| `surface` | `#FFFFFF` | Cards, bottom sheets, modals |
| `surface-alt` | `#EEF2F7` | Alternate row background in tables |
| `border` | `#D1D9E0` | Card borders, dividers, input borders |
| `border-light` | `#E9EDF2` | Subtle dividers |
| `text-primary` | `#1C2B3A` | Main text, headings |
| `text-secondary` | `#546E7A` | Labels, subtitles, placeholder text |
| `text-disabled` | `#9EABB7` | Disabled states |
| `overlay` | `rgba(0,0,0,0.45)` | Modal backdrop |

### Emergency Screen Colors

| Token | Hex | Usage |
|---|---|---|
| `emergency-bg` | `#C0392B` | EMERGENCY_NOW full banner background |
| `emergency-text` | `#FFFFFF` | Text on emergency banner |
| `urgent-bg` | `#D97706` | URGENT_SAME_DAY banner |
| `monitor-bg` | `#1A5F7A` | MONITOR_CLOSELY banner |
| `safe-bg` | `#2DC653` | LOG_ONLY / all clear |

---

## 2. Typography

**Font Family:** Inter (via `@expo-google-fonts/inter`)  
**Monospace (vitals values):** Roboto Mono (for BP, numbers in tables)

### Type Scale

| Role | Font | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `display` | Inter | 28sp | 700 (Bold) | 34 | Onboarding headings, splash |
| `h1` | Inter | 22sp | 700 | 28 | Screen titles |
| `h2` | Inter | 18sp | 600 | 24 | Section headings |
| `h3` | Inter | 15sp | 600 | 20 | Card titles, subsections |
| `body` | Inter | 14sp | 400 | 20 | Default body text |
| `body-medium` | Inter | 14sp | 500 | 20 | Slightly emphasized body |
| `label` | Inter | 12sp | 500 | 16 | Form labels, vital name tags |
| `caption` | Inter | 11sp | 400 | 15 | Timestamps, helper text |
| `vital-value` | Roboto Mono | 24sp | 500 | 30 | Main vital number display |
| `vital-value-small` | Roboto Mono | 16sp | 400 | 22 | Vital values in table cells |
| `badge` | Inter | 10sp | 600 | 13 | Status badges, severity pills |

### Text Color Rules

- Primary text on white: `text-primary` (#1C2B3A)
- Secondary/label text: `text-secondary` (#546E7A)
- Text on colored banners (emergency, success): always `#FFFFFF`
- Vital values: `text-primary` by default, overridden by status color when abnormal

---

## 3. Spacing System

Based on a 4pt grid.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro spacing (icon padding, tight gaps) |
| `space-2` | 8px | Inner element spacing |
| `space-3` | 12px | Card inner padding (compact) |
| `space-4` | 16px | Standard inner padding, list item spacing |
| `space-5` | 20px | Section spacing |
| `space-6` | 24px | Large section gaps |
| `space-8` | 32px | Screen-level padding top/bottom |
| `space-12` | 48px | Onboarding spacing |

**Screen horizontal padding:** 16px (left and right)  
**Card inner padding:** 16px  
**Bottom tab bar height:** 64px  
**Minimum tap target:** 44×44px

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Input fields, small chips |
| `radius-md` | 10px | Cards, buttons |
| `radius-lg` | 16px | Bottom sheets, modal cards |
| `radius-xl` | 24px | Onboarding illustration containers |
| `radius-full` | 9999px | Pills, circular profile photo, status dots |

---

## 5. Elevation / Shadow

| Level | Usage | Shadow |
|---|---|---|
| 0 | Flat (no shadow) | None |
| 1 | Subtle card | `0 1px 3px rgba(0,0,0,0.08)` |
| 2 | Standard card | `0 2px 8px rgba(0,0,0,0.10)` |
| 3 | Floating action, modal | `0 4px 16px rgba(0,0,0,0.14)` |
| 4 | Bottom sheet | `0 -2px 20px rgba(0,0,0,0.12)` |

---

## 6. Component Styles

### Button

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `#1A5F7A` | White | None | Main CTAs |
| Danger | `#E63946` | White | None | Emergency call, delete |
| Outline | Transparent | `#1A5F7A` | `#1A5F7A` 1.5px | Secondary actions |
| Ghost | Transparent | `#546E7A` | None | Tertiary, cancel |
| Disabled | `#E9EDF2` | `#9EABB7` | None | Inactive state |

**Button sizing:**
- Full-width: width 100%, height 48px, radius-md
- Medium: auto width, height 44px, horizontal padding 20px
- Small: height 36px, horizontal padding 14px

---

### Input Field

```
Label (12sp, text-secondary, uppercase, letter-spacing 0.5px)
┌──────────────────────────────────────┐
│  Placeholder text          [unit/icon]│  ← height 48px, border 1.5px #D1D9E0
└──────────────────────────────────────┘
Helper text or error (11sp, below field)
```

- Focused: border color `#1A5F7A`, 1.5px
- Error: border color `#E63946`
- Corner radius: `radius-sm` (6px)
- Background: white
- Padding: 12px horizontal

---

### Vital Status Badge

```
● Normal     (green dot + green text, success-surface background)
● Borderline (amber dot + amber text, warning-surface background)
● High/Low   (red dot + red text, danger-surface background)
```

- Dot: 6px circle
- Font: badge (10sp, 600)
- Padding: 2px 8px
- Border radius: radius-full

---

### Condition Card (Profile)

```
┌─────────────────────────────────────┐
│ ▌ CKD Stage 5                  ✏️  │  ← 4px left border in severity color
│   Chronic  ·  Since 01/2022        │
│   ● Severe                         │
│   Notes: Dialysis 3x/week          │
└─────────────────────────────────────┘
```

- Left border color: danger (#E63946) for severe, warning (#F4A261) for moderate, success (#2DC653) for mild
- Background: white
- Shadow: level 1
- Tap: scale 0.98 (haptic feedback if available)

---

### Emergency Button (Home Screen)

```
┌─────────────────────────────────────────┐
│   🚨  EMERGENCY CHECK                   │  ← background: danger (#E63946)
│   Tap if someone feels unwell           │  ← text: white, body-medium
└─────────────────────────────────────────┘
```

- Pulsing outer ring: `danger` at opacity 0.3, animated scale 1→1.08, opacity 1→0
- Full width card, height 80px, border radius radius-md
- Icon: 24px, white

---

### Table Row (History)

```
│ 03/06/25 │ 14:32 │  120/80 ● │  98% ● │ 72 ● │
```

- Alternating row backgrounds: white and `surface-alt` (#EEF2F7)
- Status dot inline with value
- Cell value font: `vital-value-small` (Roboto Mono 16sp)
- Date/time font: `caption` (Inter 11sp, text-secondary)
- Sticky header row: background `surface-alt`, bold label font

---

## 7. Icon System

**Library:** `@expo/vector-icons` → `MaterialCommunityIcons` + `Feather`

| Purpose | Icon name (MaterialCommunityIcons) |
|---|---|
| Emergency / Alert | `alert-circle` / `ambulance` |
| Home | `home-heart` |
| Vitals log | `heart-pulse` |
| History | `chart-line` |
| Profile | `account-circle` |
| Alerts | `bell-outline` |
| Blood pressure | `blood-bag` |
| Pulse / Heart rate | `pulse` |
| SpO2 / Oxygen | `lungs` |
| Glucose | `diabetes` |
| Temperature | `thermometer` |
| Weight | `weight-kilogram` |
| Pain | `account-injury` |
| Medications | `pill` |
| Allergy | `allergy` |
| Conditions | `hospital-box-outline` |
| Emergency contact | `phone-alert` |
| PDF Export | `file-pdf-box` |
| Settings | `cog-outline` |
| Add | `plus-circle-outline` |
| Edit | `pencil-outline` |
| Delete / Archive | `archive-outline` |
| Location | `map-marker-outline` |
| Calendar | `calendar-outline` |
| Clock | `clock-outline` |

---

## 8. PDF Design Tokens

The PDF uses inline CSS (no CSS variables — must use hex values).

| Element | Style |
|---|---|
| Document background | `#FFFFFF` |
| Header bar | `#1A5F7A` background, `#FFFFFF` text |
| Section title | `#1A5F7A` text, 2px bottom border `#1A5F7A` |
| Table header row | `#EEF4F7` background, `#1C2B3A` text, bold |
| Table border | 1px solid `#CBD5E0` |
| Odd rows | `#FFFFFF` |
| Even rows | `#F8FAFB` |
| Normal value | `#1C2B3A` |
| Warning value | `#D97706` with `#FEF3C7` background chip |
| Danger value | `#991B1B` with `#FEE2E2` background chip |
| Footer text | `#9CA3AF`, centered, 9sp |
| Page font | Helvetica, Arial, sans-serif |

---

## 9. Color Usage Rules

1. **Red (danger) is reserved for emergencies and critical vitals only** — never use for decorative purposes
2. **Teal (primary) is the brand color** — used for interactive elements, not as background fill
3. **Green (success) is for "normal/healthy"** — use sparingly, not for all positive UI states
4. **Amber (warning) is for "monitor"** — never use for decorative highlights
5. **White cards on light gray background** — the standard page structure
6. **Dark text on light backgrounds** — never reverse this for body text (accessibility)
