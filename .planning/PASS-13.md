# Pass 13 - Customer Event Detail And Checkout

## Goal

Make customer booking feel more like a real ticketing platform by moving purchase from marketplace cards into a focused event detail and checkout route.

## Scope Completed

- Added a dynamic customer route:
  - `/events/[eventId]`
- Added `EventDetailCheckout`:
  - Event poster, title, description, date/time, venue, capacity, status, and price.
  - Checkout panel with standard admission, quantity controls, order summary, and confirm booking.
  - Auth-aware CTA:
    - unauthenticated customers go to sign-in.
    - customer accounts can confirm booking.
    - organizer/admin accounts see customer-account-required state.
  - Quantity clamp respects backend `PurchaseTicketDto` max of `10` tickets per booking.
- Updated customer marketplace:
  - Event cards are now discovery entries.
  - Cards link to event detail with `View details`.
  - Removed mini-checkout controls from marketplace cards.
- Updated display pricing to INR in the UI.
- Updated organizer price helper copy from USD to INR.
- Updated docs:
  - README lists `/events/:id`.
  - README and demo script describe event-detail checkout instead of direct card purchase.
- Updated Playwright:
  - `GET /events/:id` mock added.
  - Customer booking E2E now follows marketplace -> event detail -> quantity -> confirm booking -> wallet.
  - Unauthenticated booking E2E now verifies sign-in from checkout.
  - Organizer purchase prevention now verifies detail checkout state.
  - Wallet money assertions updated for INR display.

## Verification Evidence

- Frontend lint:
  - `pnpm lint` in `client`
  - Passed.
- Frontend typecheck:
  - `pnpm exec tsc --noEmit` in `client`
  - Passed.
- Frontend production build:
  - `pnpm build` in `client`
  - Next.js build passed and reported `/events/[eventId]` as a dynamic route.
- Browser E2E:
  - Initial parallel run failed because `next build` held `.next/lock`.
  - Reran after build completed:
    - `pnpm exec playwright test --workers=1` in `client`
    - 13 tests passed.
- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 63 tests passed.
- Service e2e health checks:
  - `pnpm exec jest --runInBand --testRegex '.*e2e-spec\\.ts$'`
  - 5 suites passed, 5 tests passed.
- Backend compile:
  - `pnpm build`
  - Nest build passed.
- Diff hygiene:
  - `git diff --check`
  - Passed.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.
  - Confirmed no listener remained on port `4000`.

## Agent Findings Applied

- Followed existing thin App Router page pattern.
- Used the existing `apiClient` unwrapped response contract.
- Added explicit `GET /events/:id` Playwright mock.
- Updated stale marketplace purchase tests to the new detail checkout flow.
- Clamped checkout quantity to `Math.min(event.capacity, 10)` to match backend validation.
- Avoided calling total capacity "available seats" because the API currently exposes listed capacity, not live remaining inventory.

## Remaining Gaps

- Checkout is still intentionally simple: no seat map, payment provider, showtime variants, or ticket tiers.
- Discovery still uses inferred categories and synthetic posters rather than richer event metadata.
- Event detail shows listed capacity, not true remaining inventory.
- Event cancellation closes the listing and emits `event.cancelled`, but it still does not automatically cancel attendee tickets.
- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is removed.
- DevOps showcase work remains intentionally out of scope until the user approves the product/demo surface.

## Pass Score

97 / 100

This pass significantly improves the customer booking experience and makes the app feel more like a real ticketing platform. The score is capped because the checkout is still deliberately resume-project simple rather than a full BookMyShow clone with seats, payments, and live inventory.
