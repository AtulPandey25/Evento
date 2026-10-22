# Pass 50 - Organizer Login Context

## Goal

Make organizer sign-in entry points feel role-specific without changing authentication semantics. The login query parameter should only affect presentation, while post-login routing remains based on the authenticated account role returned by the API.

## Changes

- Added `/login?role=organizer` presentation context.
- Updated organizer-gated empty states to link `Sign in as organizer` to `/login?role=organizer`.
- Added organizer-specific login heading and supporting copy.
- Highlighted the Organizer journey card when the organizer login context is active.
- Preserved generic `/login` for customer/product paths.
- Preserved post-login routing based on returned user role.
- Updated the organizer-context login signup link to `/register?role=organizer`.
- Extended Playwright auth-entry coverage for generic login and organizer-context login.
- Updated living docs to mention organizer-context login coverage.

## What The New Tests Prove

- Generic `/login` still links generic signup to `/register`.
- `/login?role=organizer` shows organizer-specific login copy.
- Organizer-context login links account creation to `/register?role=organizer`.
- Signed-out organizer routes link to `/login?role=organizer`.
- Existing customer and organizer post-login routing behavior still passes.

## Verification

Commands:

```bash
pnpm -C client exec playwright test e2e/evento-role-paths.spec.ts --workers=1
pnpm verify
```

Result:

- Focused Playwright role-flow suite passed: 32 tests.
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

Organizer sign-in now continues the organizer journey cleanly while preserving role-based auth behavior. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
