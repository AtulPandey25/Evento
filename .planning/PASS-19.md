# Pass 19 - No-Docker Ops Surface Cleanup

## Goal

Keep the admin operations view useful for the Kafka/microservices story without showing Docker-era tools or broken local links while Docker remains intentionally removed.

## Changes

- Replaced clickable `Kafka UI` and `Mailhog` service links in `/ops` with a static runtime map.
- Changed the ops status card from hardcoded `Kafka + Mail` online to `Kafka contracts` with a verified/tested status.
- Added a `verified` health status tone for contract-backed flows.
- Updated browser E2E assertions to prove the ops page no longer exposes Kafka UI/Mailhog links.
- Updated `client/README.md` and `client/Design.md` so they no longer imply Mailhog is part of the active no-Docker workflow.

## Verification

- `pnpm lint` in `client/` - passed.
- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm exec jest --runInBand` - passed, 16 suites / 75 tests.
- `pnpm build` - passed.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm build` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 17 tests.

## Score

98 / 100

Remaining gap: `/ops` is still a static architecture/contract surface for Kafka until the final DevOps phase reintroduces live Kafka tooling.
