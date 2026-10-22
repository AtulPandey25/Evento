# Pass 22 - Organizer Booking Manifest

## Goal

Close the organizer demo loop after customer booking: organizers should be able to inspect orders and entry codes for a published listing before using check-in.

## Changes

- Added a shared `EventTicketSummary` type for organizer event ticket manifests.
- Added a lazy `/tickets/event/:eventId` query that only runs after an organizer selects a listing.
- Added `View orders` on organizer listings for published/cancelled events.
- Added a booking manifest panel with order count, ticket count, gross sales, ticket status, ticket code, quantity, price, purchase time, and checked-in time.
- Added sold/remaining seat context to organizer listing rows.
- Added Playwright coverage proving the organizer manifest uses `Bearer token-ORGANIZER` and renders order details.
- Updated README and demo script so the live walkthrough shows customer booking, organizer order inspection, and check-in as one coherent ticketing flow.

## Verification

- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm lint` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 19 tests.
- `pnpm exec jest --runInBand` - passed, 16 suites / 78 tests.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm build` in `client/` - passed.
- `pnpm build` - passed.

## Score

98 / 100

Remaining gaps:

- A future customer retail polish pass should make `/events` and `/events/:id` feel more like a consumer ticketing product with stronger imagery, featured events, showtime framing, and richer checkout confidence.
- A future no-Docker HTTP contract pass should cover the real `PUT /events/:id` gateway/events-service chain for organizer draft editing, beyond the current mocked browser E2E and service-level tests.
