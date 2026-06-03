# PulseSense — Project Context

## Expo
Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Architecture
- Expo SDK 54, expo-sqlite (local), Zustand for state
- @react-navigation/stack + bottom-tabs (5 tabs: Home, Vitals, History, Profile, Alerts)
- 14 SQLite tables with FK relationships (health_sync was added)
- Rule engine: pure TS (evaluateSymptoms + evaluateVitalThresholds)
- Health Platform: Platform adapter pattern (IHealthAdapter interface) with IOSAdapter (Apple HealthKit via react-native-health) and AndroidAdapter (Health Connect via react-native-health-connect). Lazy singleton adapter, unified public API for read/write/disconnect, ConnectionStatus tracking
- Export Module: three-tier architecture — pdfTemplates.ts (HTML generation), csvExport.ts (CSV generation), exportService.ts (orchestrator with generateExportHtml/generateExport/previewPdf/sharePdf for PDF, and csv export functions)
- Backup Service: JSON backup/restore with FK-safe restore (PRAGMA foreign_keys=OFF during data re-insertion, reverse-dependency table clearing, schema version validation, column sanitization)

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

## Play Store v1 Prep (completed by assistant)
- Updated `app.json`: added `description`, fixed package name to `com.pulsesense.app`, removed stray `android.description`
- Created `eas.json` with production build profile (app-bundle)
- Fixed `@types/jest` version mismatch (v30→v29.5)
- Added `*.aab` / `*.apk` to `.gitignore`

## Play Store v1 — Still needed by developer
1. Create Google Play Developer account ($25)
2. Generate app icon (512×512), feature graphic (1024×500), 6 screenshots (see `Docs/play_store_assets_guide.md`)
3. Host privacy policy (privacypolicies.com or GitHub Pages)
4. `eas login` → `eas build --platform android --profile production`
5. Upload `.aab` to Play Console → fill listing → rollout

## Relevant Files
- `src/screens/tabs/HistoryScreen.tsx`: Table/Charts toggle, chart data extraction for 7 standard + custom vitals
- `src/components/vitals/VitalChartCard.tsx`: Reusable line chart card with `react-native-gifted-charts`, pointer tooltip, dual-line BP support
