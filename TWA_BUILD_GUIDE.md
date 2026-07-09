# Sip — Android (TWA) Build Guide

This guide packages the Sip PWA at **https://sipwaterreminder.lovable.app** into a Play Store–ready Android app (AAB) using **Bubblewrap**, Google's official TWA tool. The web app is Play policy compliant (privacy, terms, about, contact, offline handling, no white screen, permissions minimal).

> Run these commands on **your own machine** (not inside Lovable). You need Node.js 18+ and Java 17 (JDK).

---

## 1. Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

Verify:

```bash
bubblewrap doctor
```

Follow prompts to install the Android SDK + JDK if missing (Bubblewrap does this for you).

---

## 2. Initialize the TWA project

Create an empty folder and run:

```bash
mkdir sip-android && cd sip-android
bubblewrap init --manifest="https://sipwaterreminder.lovable.app/manifest.webmanifest"
```

When prompted, use these answers:

| Question | Answer |
|---|---|
| Domain | `sipwaterreminder.lovable.app` |
| Application ID (package) | `app.sip.waterreminder` |
| App name | `Sip — Water Reminder` |
| Launcher name | `Sip` |
| Display mode | `standalone` |
| Orientation | `portrait` |
| Theme color | `#f2b84b` |
| Background color | `#faf3e2` |
| Start URL | `/` |
| Icon URL | leave default (uses `/icon-512.png`) |
| Include splash screen? | `yes` |
| Signing key | let Bubblewrap generate `android.keystore` (SAVE the password!) |

---

## 3. Build the AAB

```bash
bubblewrap build
```

Output:
- `app-release-signed.aab` → upload to Play Console
- `app-release-signed.apk` → sideload for testing

---

## 4. Digital Asset Links (REQUIRED for TWA)

After the first build, Bubblewrap prints an **SHA-256 fingerprint**. Add it to Digital Asset Links so the address bar hides:

Create `public/.well-known/assetlinks.json` in the Lovable project with:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.sip.waterreminder",
    "sha256_cert_fingerprints": ["PASTE_SHA256_FROM_BUBBLEWRAP"]
  }
}]
```

After uploading to Play Console, also add Play's app-signing SHA-256 (Play re-signs your bundle). Get it from Play Console → **Setup → App integrity → App signing key certificate**, then append it to the array above and redeploy.

Verify: `https://sipwaterreminder.lovable.app/.well-known/assetlinks.json` returns the JSON.

---

## 5. Play Console setup

### App details
- **Title**: Sip — Water Reminder
- **Short description** (80 chars): *Minimal water reminder with gentle nudges. Privacy-first. Works offline.*
- **Full description**:
  > Sip is a beautifully simple water reminder built for a hydration habit that lasts.
  >
  > • One-tap logging with custom cup sizes
  > • Hourly reminders with optional chime + Hindi voice ("पानी पियो")
  > • Streaks, daily goal, calendar view
  > • Works offline — your logs never leave your device
  > • No ads inside the app. No sign-up. No tracking.
  >
  > Perfect for anyone who wants to drink more water without another bloated tracker.

### Permissions (declare NONE beyond defaults)
TWA needs only `INTERNET`. Bubblewrap sets this automatically.

### Data Safety form
- Data collected: **None** (all data local on device).
- Data shared: **None**.
- Encryption in transit: **Yes** (HTTPS).
- User deletion: **Yes** — "Menu → Reset all data" or uninstall.

### Content rating: complete the questionnaire (Sip = **Everyone**).

### Target audience: **13+**.

### Ads declaration: **No ads** (inside the Android app; the web version's AdSense is not shipped inside the TWA).

### App Access (Demo account)
Sip **does not require login** → in App Access select "All functionality is available without special access".

### Policy links
- Privacy Policy URL: `https://sipwaterreminder.lovable.app/privacy`
- Terms URL: `https://sipwaterreminder.lovable.app/terms`
- Contact: `prasadmanish2767@gmail.com`

---

## 6. Store listing assets

Required by Play:
- **App icon**: 512×512 PNG (use `public/icon-512.png` — already there).
- **Feature graphic**: 1024×500 PNG.
- **Phone screenshots**: at least 2, 1080×1920 recommended. Capture from Chrome DevTools mobile view or from the installed TWA.

Ask the AI in Lovable to generate the 1024×500 feature graphic and marketing screenshots if needed.

---

## 7. Upload & submit

1. Create app in Play Console → **Production** (or **Internal testing** first).
2. Upload `app-release-signed.aab`.
3. Fill in all sections until every red dot turns green.
4. Submit for review. Typical review time: **1–7 days**.

---

## 8. Updating

When you ship a new web version, the TWA auto-updates because it loads the live PWA. You only need to rebuild + resubmit the AAB when:
- Manifest changes (name, icon, colors)
- You want to bump `versionCode`/`versionName`

```bash
bubblewrap update
bubblewrap build
```

---

## Troubleshooting

**Address bar shows at the top of the app** → `assetlinks.json` is missing, wrong SHA-256, or Play app-signing fingerprint not added.
**White flash on launch** → already handled by the in-page splash + `background_color` in the manifest.
**Reminders don't fire in background** → notification permission not granted or OS battery-optimizing Sip; direct users to disable battery optimization for Sip.
