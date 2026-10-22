# Pass 59 - Showcase Seed Path

## Goal

Make a fresh no-Docker local database easier to rehearse for the Evento product walkthrough without hand-entering every account, listing, and ticket.

## Changes

- Added `pnpm run seed:showcase`.
- Added `scripts/seed-showcase.mjs` with scoped, idempotent showcase data:
  - Organizer: `organizer@evento.local`
  - Customer: `customer@evento.local`
  - Admin: `admin@evento.local`
  - Shared password: `Evento@123`
  - Published event: `Launch Night Live`
  - Confirmed ticket code: `EVT-SHOWCASE-26`
- Kept the seed scoped to deterministic showcase ids/emails/ticket code instead of broad truncation or database reset.
- Added `scripts/seed-showcase.test.mjs` using Node test runner so the seed can be verified without a live database.
- Extended `verify:product` to run the product readiness guard, seed unit tests, and seed dry-run.
- Updated README, client README, demo script, product status, approval checklist, and showcase runbook with the seed command and account details.

## What The Tests Prove

- The seed script honors `DATABASE_URL` and falls back to the documented local Postgres URL.
- Dry-run prints the showcase summary without opening a database connection.
- Seed data matches current app roles/statuses and wallet arithmetic.
- Showcase password is bcrypt-compatible with login checks.
- SQL runs in dependency-safe order: tickets, events, users deletion; users, event, ticket insertion; commit.
- Event insertion uses the actual `organize_id` column.
- Query failures roll back and close resources.

## Verification

- `node --test scripts/seed-showcase.test.mjs`
  - Seed tests passed: 7 tests.
- `pnpm run verify:product`
  - Product readiness check passed.
  - Seed tests passed: 7 tests.
  - Showcase dry-run passed.
- `pnpm verify`
  - Product readiness check passed.
  - Seed tests passed: 7 tests.
  - Showcase dry-run passed.
  - Backend Jest passed: 20 suites, 96 tests.
  - Backend service e2e passed: 5 suites, 5 tests.
  - Nest build passed.
  - Client TypeScript check passed.
  - Client lint passed.
  - Next.js production build passed.
  - Playwright passed: 33 tests.

## Score

99/100

Remaining gap: final DevOps work is still intentionally gated until product approval.
