# Pass 24 - Draft Edit HTTP Contracts

## Goal

Close the verification gap where organizer draft editing was covered by mocked browser E2E and service-level tests, but not by no-Docker HTTP contracts across the real Nest route wiring.

## Changes

- Added an API Gateway HTTP contract for `PUT /events/:id`.
  - Uses the real gateway events controller.
  - Uses the real gateway events service.
  - Mocks only the downstream `HttpService`.
  - Verifies the events-service URL, normalized body, `x-user-id`, `x-user-role`, and success response envelope.
- Added an Events Service HTTP contract for `PUT /:id`.
  - Uses the real events-service controller.
  - Uses the real events-service service.
  - Mocks only `DatabaseService` and `KAFKA_SERVICE`.
  - Verifies update persistence fields and `event.updated` Kafka emission.
- Updated README testing coverage to call out no-Docker HTTP contract tests for critical gateway-to-service mutations.

## Verification

- `pnpm exec jest --runInBand apps/api-gateway/src/events/events.http.spec.ts` - passed, 1 test.
- `pnpm exec jest --runInBand apps/events-service/src/events-service.http.spec.ts` - passed, 1 test.
- `pnpm exec jest --runInBand` - passed, 18 suites / 80 tests.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm build` - passed.
- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm lint` in `client/` - passed.
- `pnpm build` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 19 tests.

## Score

99 / 100

Remaining gap: live Postgres/Kafka delivery remains intentionally unverified while Docker is removed. That belongs to the final DevOps/runtime phase after product approval.
