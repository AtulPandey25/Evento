# Pass 17 - First-Class Event City And Category

## Goal

Make the ticketing product model feel less like a UI mock by moving city and category from inferred frontend behavior into organizer-created event data.

## Changes

- Added `city` and `category` columns to the Drizzle event schema with safe defaults for local data.
- Extended `CreateEventDto`, `UpdateEventDto`, API response typing, and frontend event typing.
- Updated `events-service` create flow to persist organizer-provided city/category and provide a compatibility fallback for older payloads.
- Split organizer listing creation into separate Venue, City, and Category controls.
- Updated marketplace cards and event detail checkout to display event category/city explicitly.
- Updated marketplace filtering tests so city filtering is proven from `event.city`, even when the venue text does not contain the city.
- Added browser coverage for organizer-selected category filtering.

## Verification

- `pnpm exec jest --runInBand` - passed, 16 suites / 74 tests.
- `pnpm build` - passed.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm lint` in `client/` - passed.
- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm build` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 17 tests.

## Notes

- A root-level `pnpm exec tsc --noEmit --pretty false` was attempted and failed because the root TypeScript config is for Nest libraries/apps and does not include the Next.js JSX/path configuration. The valid client TypeScript gate passed from `client/`.
- No Docker artifacts were reintroduced.
- Live database migration execution is still deferred while Docker/local Postgres orchestration is intentionally out of the active workflow.

## Score

97 / 100

Remaining gap: schema is updated, but a live database migration/push is not verified until the user approves reintroducing local infrastructure.
