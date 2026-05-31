# Privacy Policy — PulseSense

**Last updated:** 31 May 2026 (v1.1 — added disclaimer)

## 1. No Account. No Cloud. No Tracking.

PulseSense is a **100% offline, local-first** health companion. We do **not** operate servers, databases, or analytics infrastructure. We do **not** collect, store, transmit, or share any personal data.

- No account creation or login is required.
- No data leaves your device unless **you** choose to export or share it.
- No telemetry, crash reporting, or usage analytics are built into the app.
- No third-party SDKs with data-collection behaviour are used.

## 2. Where Your Data Lives

All data you enter into PulseSense — profile information, vitals, medications, conditions, allergies, emergency contacts, and symptom check responses — is stored **exclusively in a local SQLite database on your device**.

If you uninstall the app or clear its data, this information is permanently deleted. PulseSense has no ability to recover it.

## 3. Permissions & Device Access

PulseSense requests certain device permissions solely to provide specific features. Each permission is used only when you explicitly interact with the feature that requires it.

| Permission | Purpose | Data Access |
|---|---|---|
| **Camera** | Take a profile photo | Photos are stored locally and are never transmitted. |
| **Photo Library** | Choose a profile photo from your gallery | Only images you explicitly select are read; they remain on device. |
| **Location (iOS: `NSLocationWhenInUseUsageDescription`)** | Display your current address on the Emergency Action screen | Location is read on-demand, used only for on-screen display, and is never stored or sent anywhere. |
| **Apple Health (`NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`)** | Read/write vital recordings to Apple Health (iOS) | You control which data types are shared. PulseSense only reads/writes vitals you explicitly authorise. |
| **Health Connect (Android)** | Read/write vital recordings via Health Connect | Same as above — you control authorisation per data type. |

## 4. Apple Health & Health Connect Integration

If you grant permission, PulseSense can **read** your existing vital data from Apple Health (iOS) or Health Connect (Android) to display it alongside in-app logs, and **write** vitals you log in PulseSense back to the platform's central health record.

This integration is **opt-in** and can be revoked at any time via your device's Health privacy settings. PulseSense never reads or writes health data without your explicit consent.

## 5. Exports & Sharing

PulseSense includes a **PDF export** feature. When you generate and share an export (Medical ID, Vitals Report, Medications, Emergency Alerts, or a Full Report), the resulting PDF is created locally on your device. Sharing it (via email, messaging, AirDrop, etc.) is initiated by you through the operating system's native share sheet.

PulseSense has **no access to recipients, delivery status, or shared content**.

## 6. Data Security

Because all data remains on your device, its security is governed by your device's built-in protections (screen lock, encryption, sandboxing). PulseSense does not add a separate app-level password or encryption layer.

We recommend:
- Using a strong device passcode or biometric lock.
- Keeping your operating system up to date.

## 7. Children's Privacy

PulseSense is not directed at children under the age of 13. We do not knowingly collect any personal information from children. If you believe a child has provided personal data through the app, please contact us so we can assist in removing it (though note that all data is stored locally, not on our servers).

## 8. Third-Party Services

PulseSense uses **no third-party analytics, advertising, crash reporting, or cloud services**. The app is built entirely with open-source and Expo-managed libraries that do not transmit data externally.

A full list of dependencies is available in the app's `package.json` and the Expo build output.

## 9. Changes to This Policy

If this policy is updated, the "Last updated" date at the top will change. Because the app does not connect to the internet, updates to this policy will be delivered through app store updates.

## 10. Medico-Legal Disclaimer

<div style="border: 2px solid #dc2626; border-left: 6px solid #dc2626; background: #fef2f2; border-radius: 8px; padding: 1.25rem 1.5rem; margin: 1rem 0;">

PulseSense is **not a medical device**. It has not been cleared or approved by the FDA, MHRA, or any other regulatory body. It does **not** provide a medical diagnosis, treatment recommendation, or clinical decision support.

The emergency triage engine uses a static, rule-based checklist for informational guidance only. It may produce false positives, false negatives, or be inappropriate for your specific condition. **If you believe you are experiencing a medical emergency, call your local emergency services immediately (e.g., 911, 112, 999). Do not delay seeking professional medical attention based on information provided by this app.**

All health data entered into and exported from PulseSense is for **personal reference and informational use only**. You should always consult a qualified healthcare professional before making any medical decisions, changing a treatment plan, or interpreting your vital signs.

By using PulseSense, you acknowledge that:
- The app is a voluntary self-tracking and informational tool.
- No healthcare provider–patient relationship is established.
- The developer(s) assume no liability for any actions taken or not taken based on the app's output.
- Any PDF exports generated by the app are informational summaries, not clinical documents, and may not be suitable for medical records.

</div>

## 11. Contact

For questions about this privacy policy, please open an issue at:

**https://github.com/anomalyco/PulseSense/issues**

Or contact the developer directly:

- GitHub: [SolarisXD](https://github.com/SolarisXD)

---

*PulseSense — Not a doctor. Not a diagnosis. The right action, at the right moment.*
