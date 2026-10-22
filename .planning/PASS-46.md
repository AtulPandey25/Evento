# Pass 46 - Organizer Manifest Authorization Contract

## Goal

Make organizer manifest authorization precise and covered. If an organizer tries to view another organizer's event orders, the service should return a manifest-specific authorization error instead of reusing check-in wording.

## Changes

- Updated `findEventTickets` authorization failure text to `You are not authorized to view tickets for this event`.
- Added ticket-service coverage blocking customers from viewing event booking manifests.
- Added ticket-service coverage blocking non-owning organizers from viewing another organizer's event manifest.
- Updated living docs to mention organizer manifest authorization tests.

## What The New Tests Prove

- Customer accounts cannot inspect organizer manifests.
- Organizers cannot inspect another organizer's event orders.
- Unauthorized manifest access does not emit Kafka events.
- The error message now matches the manifest action being attempted.

## Verification

Commands:

```bash
pnpm exec jest apps/tickets-service/src/tickets-service.service.spec.ts --runInBand
pnpm verify
```

Result:

- Targeted ticket-service spec passed: 23 tests.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 92 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 31 tests.

## Score

99/100

The organizer manifest authorization contract is clearer and covered. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
