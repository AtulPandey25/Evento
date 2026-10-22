# Pass 39 - Demo Entry Route E2E Coverage

## Goal

Protect the product demo entry points with browser coverage. Evento should open as a ticket marketplace, and the removed `/host` route should stay removed so the app consistently presents Customer and Organizer surfaces.

## Changes

- Added a Playwright test proving `/` redirects into `/events` and renders the marketplace.
- Added a Playwright test proving `/host` returns 404 and does not expose the organizer workspace.
- Updated living docs to mention marketplace entry routing and old-route removal coverage.

## What The New Tests Prove

- A demo starts directly on the customer ticketing surface instead of a starter page or technical dashboard.
- The old `/host` organizer alias cannot accidentally come back as a public route.
- The customer/organizer route language from Pass 38 is now protected at browser level.

## Verification

Commands:

```bash
pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Targeted Playwright role-flow suite passed: 29 tests.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 84 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed and listed no `/host` route.
- Playwright role-flow suite passed in the full gate: 29 tests.

## Score

99/100

The demo entry path and organizer route cleanup are now protected by E2E coverage. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
