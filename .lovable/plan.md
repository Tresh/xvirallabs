
Goal: make data persistence and visibility reliable so users always know where their data is, which account they are in, and why something is missing.

1) What I found (current diagnosis)
- Your data is not saved to localhost. Persistent data is in the Lovable Cloud backend.
- Browser storage is only being used for:
  - auth session token
  - theme preference
  - last selected dashboard tab
- Security policies are in place for profile/memory/analyses tables and are not the primary failure here.
- Runtime evidence shows account-level data mismatch behavior: the account currently seen in recent auth activity has analyses, but profile/memory fields are empty. This pattern is consistent with “signed into a different account than expected” or prior empty overwrite on that same account.
- You answered:
  - sign-in method: “Not sure”
  - still visible: “Analyses”
  This strongly supports account confusion + weak in-app account visibility.

2) Root causes to fix permanently
- No strong “you are signed in as X” visibility in dashboard/settings.
- Google login does not force account picker, so users can land in the wrong account silently.
- Settings save path uses update-only behavior, which can silently no-op when rows are missing/misaligned.
- No user-facing “data health” view (counts + last updated per data area), so missing data feels random.

3) Implementation plan (once-and-for-all fix)

Phase A — Account clarity (highest impact)
- Add a persistent account identity block (Dashboard header + Settings Account section):
  - email
  - login provider
  - short user id
  - “Switch account” action
- In Google sign-in, force account selection every time (`prompt: select_account`) to prevent silent wrong-account login.
- On auth screen, show explicit “Use the same account you used before” helper text.

Phase B — Data integrity hardening
- In auth bootstrapping:
  - add a “self-heal ensure rows” step for profile + brand voice (create if missing), then fetch.
  - handle and surface fetch errors instead of silently setting null state.
- In settings save:
  - switch from update-only to safe upsert semantics with strict success checks.
  - fail loudly if no row was affected.
  - keep hydration guard and field-diffing, but add explicit “row exists” verification before enabling save.

Phase C — Data visibility and trust
- Add a “Data Health” panel in Settings showing live backend counts:
  - Profile fields completeness
  - Memory/voice completeness
  - Analyses / patterns / ideas counts
  - Daily feed count (today)
  - Last updated timestamps
- Add a “Refresh from backend” button so users can verify immediately without reload.

Phase D — Recovery workflow for split/legacy accounts
- Build an internal recovery checklist:
  1) confirm current account identity in UI
  2) query backend for that account’s profile/memory/analyses counts
  3) if user confirms they used another account, guide re-login to that account
  4) if required and approved, perform one-time backend reconciliation of user-owned records
- If old values were truly overwritten and no historical copy exists, communicate that clearly and restore baseline by re-entering once (after hardening is live).

4) Technical implementation details
````text
Auth/Login
  -> show account identity
  -> Google login with account picker
  -> session established

Auth bootstrap
  -> ensure profile row exists
  -> ensure brand_voice row exists
  -> fetch both rows
  -> expose explicit load/error state

Settings Save
  -> hydration check
  -> diff changed fields
  -> upsert profile + memory safely
  -> verify affected row(s)
  -> refresh + show backend timestamps/counts
````

Files to update
- src/pages/Auth.tsx
- src/contexts/AuthContext.tsx
- src/components/dashboard/SettingsTab.tsx
- (optional small identity badge in) src/pages/Dashboard.tsx

Backend read/validation steps during rollout
- Verify per-user row presence in profile + brand voice.
- Verify save operations affect exactly expected user row.
- Verify no cross-user visibility regressions under existing RLS.

5) Acceptance criteria (must pass)
- User can always see exactly which account is active.
- Re-login with Google always shows account picker.
- Saving settings persists after refresh + logout/login.
- Settings page shows objective backend counts/timestamps for all major data buckets.
- “Analyses present but memory missing” cases are diagnosable in one screen (not guesswork).

6) Test plan
- End-to-end tests across both auth paths (email/password and Google).
- Refresh persistence checks:
  - save profile/memory -> refresh -> logout/login -> verify unchanged
- Wrong-account simulation:
  - login account A then B -> verify identity block and distinct data health in each.
- Regression check:
  - daily feed and analyses still load correctly after hardening.

This plan prioritizes trust first: make account identity obvious, make saves verifiable, and make backend state visible so neither you nor your users are left guessing.
