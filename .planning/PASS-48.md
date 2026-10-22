# Pass 48 - Wrong-Role Journey Recovery

## Goal

Make locked organizer routes feel like intentional product journeys instead of dead-end access panels. Customers who land on organizer routes should be guided back to customer booking, while signed-out users should have clear organizer authentication actions.

## Changes

- Added optional action links to the shared `EmptyState` component.
- Changed organizer-route navigation so organizer subnav appears only for authenticated organizer/admin users.
- Added role-aware recovery actions on organizer routes:
  - Signed-in customers see `Return to Browse` and `Open My tickets`.
  - Signed-out users see `Sign in as organizer` and `Create organizer account`.
- Extended Playwright role-flow coverage for wrong-role customer recovery and organizer sign-out recovery.
- Updated living docs to mention wrong-role journey recovery coverage.

## What The New Tests Prove

- Customer accounts opening organizer routes see a clear access state without organizer tools.
- Wrong-role customers do not see organizer check-in navigation.
- Customers can return from the organizer route to the marketplace.
- Signed-out organizer routes provide organizer sign-in and signup actions.

## Verification

Commands:

```bash
pnpm -C client exec playwright test e2e/evento-role-paths.spec.ts --workers=1
pnpm verify
```

Result:

- Focused Playwright role-flow suite passed: 31 tests.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 94 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 31 tests.

## Score

99/100

The customer and organizer journeys now recover more cleanly when users land on the wrong surface. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
