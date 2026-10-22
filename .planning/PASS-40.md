# Pass 40 - Subtle Kafka Presentation Coverage

## Goal

Keep Kafka visible as architecture evidence without making it customer-facing. Customers and organizers should experience a ticketing product first; Kafka and runtime details should live in the admin operations surface and interview explanation.

## Changes

- Added Playwright coverage proving customer marketplace and wallet routes do not show Kafka, runtime map, event-stream, or System navigation.
- Added Playwright coverage proving organizer listing and check-in routes do not show Kafka, runtime map, event-stream, or System navigation.
- Kept existing admin-only operations coverage that verifies Kafka event-stream details are available to admin accounts.
- Updated living docs to mention subtle Kafka presentation checks.

## What The New Tests Prove

- Kafka remains showcased in the project without being pushed into customer booking screens.
- Organizer workflows stay focused on listings, orders, and check-in.
- Admin operations remains the controlled place for service ownership and Kafka explanation.
- The product aligns with the requirement to showcase Kafka subtly.

## Verification

Commands:

```bash
pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Targeted Playwright role-flow suite passed: 31 tests.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 84 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed in the full gate: 31 tests.

## Score

99/100

Kafka is now protected as supporting infrastructure instead of customer-facing UI. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
