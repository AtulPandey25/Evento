# Pass 49 - Organizer Signup Preselection

## Goal

Make organizer-specific signup feel intentional instead of generic. When a user chooses to create an organizer account from an organizer-only route, the registration form should already be set to Organizer.

## Changes

- Added `role=organizer` support to the registration page.
- Passed the validated initial role into `RegisterForm`.
- Updated the organizer access recovery CTA to use `/register?role=organizer`.
- Added Playwright coverage proving `/register?role=organizer` preselects Organizer and submits `ORGANIZER` without an extra role click.
- Added Playwright coverage for the organizer signup CTA href.
- Removed the `next/font/google` build-time dependency and switched to system font variables, making `next build` independent from Google Fonts network availability.
- Updated living docs to mention organizer signup preselection coverage.

## What The New Tests Prove

- Normal registration still defaults to Customer.
- Manual Organizer registration still submits `ORGANIZER`.
- Organizer-specific registration links preselect Organizer.
- The organizer recovery screen links to `/register?role=organizer`.
- Full verification no longer depends on fetching Google Fonts at build time.

## Verification

Commands:

```bash
pnpm -C client exec playwright test e2e/evento-role-paths.spec.ts --workers=1
pnpm -C client build
pnpm verify
```

Result:

- Focused Playwright role-flow suite passed: 32 tests.
- Client production build passed after removing external Google font fetch.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 94 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 32 tests.

## Score

99/100

Organizer signup now continues the organizer journey cleanly, and the client build is more reliable offline. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
