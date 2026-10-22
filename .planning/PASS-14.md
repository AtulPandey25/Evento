# Pass 14 - Customer Marketplace Discovery

## Goal

Make the customer marketplace feel more like a ticketing storefront by adding practical discovery controls: city filtering, date/month filtering, and sorting.

## Scope Completed

- Added derived marketplace helpers:
  - `getEventCity`
  - `getEventMonthKey`
  - `formatEventMonth`
  - `EventSortOrder`
- Added customer discovery state in `EventoConsole`:
  - selected city
  - selected month
  - sort order
- Updated marketplace filtering:
  - search now includes title, description, venue, derived city, and category.
  - category, city, month, and search combine together.
  - sorting supports soonest first, price low-to-high, and price high-to-low.
  - filtering happens before sorting, so React Query event data is not mutated.
- Updated customer marketplace UI:
  - Added City, Date, and Sort selects.
  - Added visible result count.
  - Reset now clears search, category, city, month, and sort.
  - Renamed section from `Recommended events` to `Events near you`.
  - Added stable `event-card-title` test hook for browser order assertions.
- Updated organizer event form copy:
  - `Venue` now reads `Venue and city` so future events provide better marketplace city data.
- Updated docs:
  - README now describes search, city/date filters, sorting, detail checkout, and booking.
  - Demo script now calls out category, city, date, and sort controls.
- Updated Playwright:
  - Added a second mocked published event.
  - Added coverage for city filter and reset.
  - Added coverage for month filter and price sorting.
  - Updated organizer creation test to submit venue plus city.

## Verification Evidence

- Frontend lint:
  - `pnpm lint` in `client`
  - Passed.
- Frontend typecheck:
  - `pnpm exec tsc --noEmit` in `client`
  - Passed.
- Diff hygiene:
  - `git diff --check`
  - Passed.
- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 63 tests passed.
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
  - Initial Playwright run found strict locator issues in the new tests because event titles appear both on the poster and card title.
  - Fixed tests to assert the stable `event-card-title` list.
  - Rerun passed:
    - `pnpm exec playwright test --workers=1` in `client`
    - 15 tests passed.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.
  - Confirmed no listener remained on port `4000`.

## Agent Findings Applied

- Avoided mutating React Query data by sorting the filtered array result, not `publishedEvents` directly.
- Reset clears every new control.
- Kept city filtering derived from existing free-text `location` to avoid backend schema churn.
- Nudged organizer copy toward venue plus city to make derived city filtering more reliable.
- Added sort-order assertions rather than only visibility assertions.

## Remaining Gaps

- City is still derived from free-text venue/location rather than a dedicated `city` field.
- Categories are still inferred from title/description and fallback index.
- Date filtering is month-level, not exact day/weekend/showtime.
- Event detail shows listed capacity, not true remaining inventory.
- Checkout remains intentionally simple: no seat map, payment provider, showtime variants, or ticket tiers.
- Event cancellation closes the listing and emits `event.cancelled`, but it still does not automatically cancel attendee tickets.
- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is removed.
- DevOps showcase work remains intentionally out of scope until the user approves the product/demo surface.

## Pass Score

96 / 100

This pass makes the customer marketplace substantially more ticketing-like and easier to demo. The score is capped because true city/category/date modeling still belongs in a future schema/product pass rather than a derived frontend-only layer.
