# Pass 15 - Remaining Ticket Inventory

## Goal

Make Evento show and enforce remaining ticket inventory so the customer booking flow feels more like a real ticketing platform.

## Scope Completed

- Added public inventory fields to event responses:
  - `soldTickets`
  - `remainingCapacity`
- Updated `events-service` public reads:
  - `findAll()` returns published events enriched with sold and remaining inventory.
  - `findOne()` returns event detail enriched with sold and remaining inventory.
  - Remaining capacity is clamped to `0` so public UI never shows negative seats.
- Updated capacity semantics:
  - `CONFIRMED` tickets consume inventory.
  - `CHECKED_IN` tickets also consume inventory.
  - `CANCELLED` tickets do not consume inventory.
- Updated `tickets-service` purchase capacity enforcement:
  - purchases now count `CONFIRMED` plus `CHECKED_IN` tickets before allowing new purchases.
- Updated shared/client types:
  - `EventResponse` supports `soldTickets` and `remainingCapacity`.
  - client `Event` supports `soldTickets` and `remainingCapacity`.
- Updated customer UI:
  - marketplace cards show remaining seats when available.
  - event detail shows seats left and booked-of-capacity counts.
  - checkout quantity clamps to remaining seats and the backend max of `10`.
  - sold-out event detail shows a sold-out notice and disables booking.
- Updated docs:
  - README mentions remaining ticket inventory and capacity enforcement.
  - Demo script explains remaining seats and checked-in-ticket capacity behavior.
- Updated tests:
  - events-service tests cover inventory fields, zero-clamping, and checked-in inventory consumption.
  - tickets-service tests cover checked-in tickets blocking future purchases.
  - Playwright fixtures include sold and remaining inventory.
  - Browser E2E covers remaining-seat display and sold-out disabled checkout.

## Verification Evidence

- Frontend lint:
  - `pnpm lint` in `client`
  - Passed.
- Frontend typecheck:
  - `pnpm exec tsc --noEmit` in `client`
  - Passed.
- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 68 tests passed.
- Diff hygiene:
  - `git diff --check`
  - Passed.
- Backend compile:
  - `pnpm build`
  - Nest build passed.
- Service e2e health checks:
  - `pnpm exec jest --runInBand --testRegex '.*e2e-spec\\.ts$'`
  - 5 suites passed, 5 tests passed.
- Frontend production build:
  - `pnpm build` in `client`
  - Next.js build passed.
- Browser E2E:
  - `pnpm exec playwright test --workers=1` in `client`
  - 16 tests passed.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.
  - Confirmed no listener remained on port `4000`.

## Agent Findings Applied

- Changed inventory semantics so checked-in tickets still consume capacity.
- Kept cancelled tickets excluded from consumed capacity.
- Kept marketplace header as `listed seats` while cards/detail show remaining seats.
- Updated Playwright fixtures to exercise the intended API shape instead of only fallbacks.
- Added sold-out checkout coverage.

## Remaining Gaps

- Inventory queries use one aggregate query per event in public listing. This is acceptable for resume-demo scale but could become a grouped aggregate later.
- Purchase enforcement is still read-then-insert without database-level locking; concurrent live purchases could still race in a production system.
- City is still derived from free-text venue/location rather than a dedicated `city` field.
- Categories are still inferred from title/description and fallback index.
- Checkout remains intentionally simple: no seat map, payment provider, showtime variants, or ticket tiers.
- Event cancellation closes the listing and emits `event.cancelled`, but it still does not automatically cancel attendee tickets.
- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is removed.
- DevOps showcase work remains intentionally out of scope until the user approves the product/demo surface.

## Pass Score

97 / 100

This pass closes a real ticketing-product gap by making inventory visible and enforcing checked-in tickets as capacity-consuming. The score is capped because concurrency-safe purchase locking and richer ticket inventory modeling remain outside the current resume-project scope.
