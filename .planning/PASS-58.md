# Pass 58 - Showcase Runbook And Demo Smoke

## Goal

Make the project easier to rehearse as a resume walkthrough while preserving the no-Docker product phase.

## Changes

- Added `docs/SHOWCASE-RUNBOOK.md` with a concrete no-Docker rehearsal path, runtime prerequisites, route sequence, account guidance, Kafka talking points, and stop conditions.
- Linked the showcase runbook from the root README, product status snapshot, approval checklist, and client README.
- Updated the client README so it points to the root `pnpm verify` gate and clarifies that client-only development expects the live API Gateway/services.
- Changed the API Gateway Redis throttler default from Docker-style host `redis` to no-Docker host `localhost`.
- Added unit coverage for Redis connection defaults and env overrides.
- Added a continuous Playwright demo smoke test covering organizer create/publish, customer multi-ticket purchase, wallet confirmation, organizer booking manifest, and organizer check-in using one mutable mocked API state.
- Updated the product-readiness guard to require the showcase runbook.

## What The Tests Prove

- The API Gateway Redis throttler now defaults correctly for local no-Docker development while still honoring explicit env overrides.
- The exact interviewer-style walkthrough is protected as one browser flow, not only as disconnected role tests.
- Product readiness now fails if the showcase runbook is missing.

## Verification

- Focused Redis unit test passed: 1 suite, 2 tests.
- Focused demo script Playwright smoke passed: 1 test.
- `pnpm verify`
  - Product readiness check passed.
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
