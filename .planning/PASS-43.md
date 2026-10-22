# Pass 43 - Exact-Capacity Multi-Ticket Contract

## Goal

Strengthen the backend ticketing contract around multi-ticket purchases. Customers should be able to buy exactly the remaining number of seats, while over-capacity purchases remain rejected.

## Changes

- Added ticket-service coverage for a multi-ticket purchase that exactly matches remaining capacity.
- Strengthened the existing multi-ticket purchase test to assert the database insert payload stores quantity, total price, event id, user id, and confirmed status.
- Updated product docs to mention multi-ticket capacity contract coverage.

## What The New Test Proves

- If 3 seats remain and the customer buys 3 tickets, the purchase succeeds.
- The service persists the multi-ticket quantity and computed total price.
- The Kafka `ticket.purchased` event carries the same quantity and total price.
- The existing over-capacity and checked-in-capacity protections still pass.

## Verification

Commands:

```bash
pnpm exec jest apps/tickets-service/src/tickets-service.service.spec.ts --runInBand
pnpm verify
```

Result:

- Targeted ticket-service spec passed: 16 tests.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 85 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 31 tests.

## Score

99/100

The multi-ticket booking contract is stronger at the service layer. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
