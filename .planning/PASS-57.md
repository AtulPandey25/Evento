# Pass 57 - Product Copy Polish

## Goal

Remove remaining user-visible copy that still sounded like an internal tool or scaffold and replace it with ticketing-product language.

## Changes

- Replaced `wallet item(s)` with `saved pass` / `saved passes`.
- Replaced empty-wallet copy `Buy from Browse...` with `Book an event from Browse...`.
- Replaced admin action `Probe gateway` with `Check gateway`.
- Replaced generic fallback copy `Something went wrong` with `We could not complete that action.`
- Replaced API Gateway unreachable-service fallbacks with the same finished-product error copy.
- Replaced premature checkout copy `confirm your entry code` with `confirm your booking`.
- Replaced fragmented mobile-entry copy with `Entry code issued after booking` and `Scan at the gate`.
- Replaced sold-out quantity copy `Up to 0 tickets per booking` with `No tickets available for this showtime`.
- Standardized organizer/customer-facing wording from `orders` to `bookings`/`booking manifest`.
- Replaced `ticket(s)` with proper pluralized ticket copy.
- Updated docs and Playwright assertions to protect the polished wording.

## What The Tests Prove

- Product readiness still blocks Docker artifacts, scaffold copy, old `/host` organizer routing, and missing customer/organizer/admin product surfaces.
- Backend service tests still cover role contracts, organizer ownership, multi-ticket capacity, ticket cancellation, check-in, Kafka payload behavior, and notification workflows.
- Service e2e health checks still pass for all NestJS services.
- Client typecheck, lint, and production build still pass.
- Playwright still covers customer booking, multi-ticket quantity, wallet, cancellation confirmation, organizer creation/publish/edit/cancel, booking manifests, check-in, admin-only operations, Kafka staying out of customer/organizer product routes, and mobile customer/organizer layouts.

## Verification

- `pnpm verify`
  - Product readiness check passed.
  - Backend Jest passed: 19 suites, 94 tests.
  - Backend service e2e passed: 5 suites, 5 tests.
  - Nest build passed.
  - Client TypeScript check passed.
  - Client lint passed.
  - Next.js production build passed.
  - Playwright passed: 32 tests.

## Score

98/100

Remaining gap: the product/demo surface is now strong, but the final DevOps layer remains intentionally gated until user approval.
