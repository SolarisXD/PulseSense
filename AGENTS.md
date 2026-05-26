# PulseSense — Project Context

## Expo
Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Architecture
- Expo SDK 54, expo-sqlite (local), Zustand for state
- @react-navigation/stack + bottom-tabs (5 tabs: Home, Vitals, History, Profile, Alerts)
- 13 SQLite tables with FK relationships
- Rule engine: pure TS (evaluateSymptoms + evaluateVitalThresholds)

## Accomplished
### Bug Fixes
- N+1 in getMedications/getActiveMedications → IN clause + JS grouping
- Import direction notificationService.ts → direct db import
- ExportScreen stuck loading → setGenerating in finally
- 6 empty catch blocks → console.warn
- deleteProfile transaction → BEGIN/COMMIT/ROLLBACK
- cancelAllMedicationReminders → filters by med- prefix (not nuke all)
- rescheduleAllMedicationReminders → Promise.allSettled
- setPrimaryContact → wrapped in SQLite transaction
- getLatestPerVital → 7 parallel per-type queries (no more LIMIT 20 blind spot)
- Onboarding → back button on FeaturesScreen + SetupProfileScreen
- useHealthInsights → 30s in-memory cache

### Features
- Delete Profile in Settings Danger Zone (typed confirmation modal)
- Dark mode on 11 screens
- Vital line charts in History tab (Table/Charts toggle)

### Features
- Custom vital charts in History tab
- Touch interaction on chart data points (tap/hold to see exact value/date)

## Follow-ups
- (none)

## Relevant Files
- `src/screens/tabs/HistoryScreen.tsx`: Table/Charts toggle, chart data extraction for 7 standard + custom vitals
- `src/components/vitals/VitalChartCard.tsx`: Reusable line chart card with `react-native-gifted-charts`, pointer tooltip, dual-line BP support
