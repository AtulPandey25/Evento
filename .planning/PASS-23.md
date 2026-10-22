# Pass 23 - Customer Retail Polish

## Goal

Make the customer booking surface feel closer to a consumer ticketing product instead of a clean CRUD event list.

## Changes

- Added photographic event poster treatment using stable per-event poster selection so filtering and sorting do not change an event's visual identity.
- Added a featured event strip on `/events` with poster imagery, category, city/date context, seat availability, and a `Book featured event` action.
- Changed customer event cards from `View details` to `Book now`.
- Added low-seat urgency through shared `getSeatAvailability` logic for cards, featured strip, and event detail.
- Prevented the featured strip from showing an unrelated event when filters return zero matches.
- Upgraded event detail checkout with featured poster imagery, a `You're booking` event recap, showtime/venue context, ticket type, included convenience fee, wallet confirmation note, and product-facing no-extra-fee copy.
- Updated Playwright coverage for the new retail booking language and duplicate featured/card availability states.
- Updated README and demo script to present the improved customer retail flow.

## Verification

- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm lint` in `client/` - passed after rerun.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 19 tests.
- `pnpm build` in `client/` - passed.
- `pnpm exec jest --runInBand` - passed, 16 suites / 78 tests.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm build` - passed.

## Score

98 / 100

Remaining gaps:

- A no-Docker HTTP contract pass should still cover the real `PUT /events/:id` gateway/events-service chain for organizer draft editing.
- The final DevOps layer remains intentionally deferred until product approval: GitHub Actions, Docker, Kubernetes, Terraform, and deployment docs.
