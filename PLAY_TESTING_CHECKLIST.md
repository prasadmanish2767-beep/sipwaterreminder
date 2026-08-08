# Sip — Play Console Testing Checklist (Internal → Closed → Open)

App: **Sip — Water Reminder** · Package: `app.sip.waterreminder`
Web: https://sipwaterreminder.lovable.app

Goal: pass **Internal testing**, **Closed testing** and **Open testing** without rejection.

---

## 0. What's already done in the app (rejection-proofing)

| Play requirement | Status | Where |
|---|---|---|
| Privacy Policy URL | ✅ | `/privacy` |
| Terms | ✅ | `/terms` |
| **Data deletion URL** (mandatory since 2023) | ✅ | `/data-deletion` |
| In-app data deletion | ✅ | Menu → Data → Reset all data |
| In-app consent screen | ✅ | ConsentGate on first launch |
| Health disclaimer (not medical advice) | ✅ | `/terms` §2 + Smart Goal card |
| Offline handling, no white screen | ✅ | Splash + OfflineBanner |
| Digital Asset Links | ✅ | `/.well-known/assetlinks.json` |
| Only INTERNET permission | ✅ | Bubblewrap default |
| No login required | ✅ | App Access → "no special access" |
| Contact email | ✅ | prasadmanish2767@gmail.com |

⚠️ After Play re-signs your AAB, **append Play's app-signing SHA-256** to `public/.well-known/assetlinks.json` and re-publish the site, otherwise the URL bar shows in the TWA.

---

## 1. Internal testing (fastest — no review wait)

- Up to **100 testers**, added by email in Play Console → Testing → Internal testing.
- Upload `app-release-signed.aab`.
- Complete these before the track will roll out:
  - App content: Privacy policy URL, Ads = **No ads**, App access = **no login**, Content rating questionnaire, Target audience = **13+**, News app = No, COVID/health apps = No, Data safety, Government apps = No, Financial features = None, Health apps declaration = **not a health app** (wellness only).
  - Store listing: title, short + full description, 512×512 icon, 1024×500 feature graphic, ≥ 2 phone screenshots (you have 8).
- Rollout is usually live in **minutes**.

**Common failure:** missing Data safety form or the health-apps declaration. Answer health declaration as a general wellness/hydration tracker, **not** a medical or health-data app.

---

## 2. Closed testing (required before production for new personal accounts)

- Create a closed track (e.g. "alpha"), add testers via **email list** or a **Google Group** (Group is safer — Play counts opted-in testers).
- Personal developer accounts created after Nov 2023 must run **12 continuous testers for 14 days** before production access. Plan:
  - Recruit **at least 15 testers** (buffer for drop-offs).
  - Every tester must **opt in via the web link** AND **install** the app.
  - Nobody uninstalls or opts out during the 14 days.
  - Keep the app updated at least once during the period (shows active development).
- Test on real devices: Android 8 → 15, and one tablet.

**Checklist per tester:** opt-in link opened → installed → app opens without crash → notification permission prompt appears → reminder fires.

---

## 3. Open testing (public beta)

- Anyone with the link can join; the listing becomes **publicly visible**, so it gets a **real review** (1–7 days).
- Extra strictness here:
  - Screenshots must show the **actual app**, no misleading mockups or fake stats claims.
  - Title ≤ 30 chars, no keyword stuffing ("Water Reminder Best Free Tracker 2026" = rejection).
  - Full description must not promise medical benefits ("cures", "treats", "medically proven" → banned).
  - No "beta"/"test" wording in the store title.
  - Ads declaration must match reality: the TWA ships **no ads** (AdSense is web-only, not loaded in the TWA build).

---

## 4. Pre-submission smoke test (run before every upload)

1. Fresh install → consent screen appears → accept.
2. Reminder setup onboarding → pick interval, quiet hours, unit → saves.
3. Add a cup → progress ring updates → survives app restart.
4. Notification permission → deny → app still fully usable (no dead-end).
5. Airplane mode → open app → offline banner, no white screen.
6. Menu → Export backup → import backup → data restored.
7. Menu → Reset all data → everything clears.
8. Rotate / small screen (360dp) → no clipped UI.
9. Back button from every page returns correctly, never exits abruptly from a sub-page.
10. `https://sipwaterreminder.lovable.app/.well-known/assetlinks.json` returns 200 JSON and no URL bar shows in the TWA.

---

## 5. Data safety form answers (copy-paste)

- Does your app collect or share any of the required user data types? → **No**
- Is all of the user data encrypted in transit? → **Yes**
- Do you provide a way for users to request that their data is deleted? → **Yes** → URL: `https://sipwaterreminder.lovable.app/data-deletion`

---

## 6. Version bump before each new upload

```bash
bubblewrap update      # pulls latest manifest
bubblewrap build       # bump versionCode in twa-manifest.json first
```

`versionCode` must be strictly greater than the previous upload on **every** track.
