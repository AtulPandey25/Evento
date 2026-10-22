# Pass 26 - Interview Guide

## Goal

Make Evento easier to explain as a resume project by adding a single interview guide that answers what the project is, how the user flows work, what Kafka does, what to show, what tests prove, and what not to overclaim.

## Changes

- Added `docs/INTERVIEW-GUIDE.md`.
- Covered the one-minute explanation, problem framing, architecture, customer flow, organizer flow, admin flow, Kafka story, testing story, walkthrough order, caveats, and resume bullet ideas.
- Linked the guide from `README.md`.
- Linked the guide from `docs/DEMO-SCRIPT.md`.

## Verification

- Checked the guide against current routes, Kafka topic constants, verification scripts, and existing docs.
- `pnpm verify` - passed.
  - Backend Jest: 18 suites / 80 tests.
  - Service e2e: 5 suites / 5 tests.
  - Nest build: passed.
  - Client typecheck: passed.
  - Client lint: passed.
  - Client build: passed.
  - Playwright: 19 tests passed.

## Score

99 / 100

Remaining gap: final live Postgres/Kafka runtime verification and DevOps assets remain intentionally deferred until product approval.
