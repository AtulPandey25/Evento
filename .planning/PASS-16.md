# Pass 16 - Event Cancellation Ticket Orchestration

## Goal

Complete the event cancellation flow so organizer cancellation closes sales and also cancels confirmed attendee tickets through Kafka-backed service orchestration.

## Scope Completed

- Added `tickets-service` event cancellation orchestration:
  - consumes `event.cancelled`
  - selects confirmed tickets for the cancelled event
  - updates those tickets to `CANCELLED`
  - emits `ticket.cancelled` for each affected customer ticket
- Started the tickets Kafka consumer in `tickets-service` bootstrap:
  - HTTP service still runs on the tickets port
  - Kafka microservice consumer now starts with `tickets-service-group`
- Preserved ticket semantics:
  - `CONFIRMED` tickets are auto-cancelled by event cancellation
  - `CHECKED_IN` tickets are not retroactively undone
  - already `CANCELLED` tickets remain untouched
- Reused existing notification path:
  - event cancellation triggers organizer notification through `notifications-service`
  - ticket auto-cancellation triggers customer cancellation notifications through existing `ticket.cancelled` handling
- Updated docs:
  - README now describes tickets-service as Kafka producer/consumer for event-cancellation ticket orchestration
  - README Kafka story now says event cancellation auto-cancels confirmed attendee tickets
  - Demo script now explains `event.cancelled` is consumed by both notifications-service and tickets-service
  - Old caveat was replaced with the precise checked-in-ticket caveat
- Added tests:
  - service test for auto-cancelling confirmed tickets and emitting customer `ticket.cancelled` events
  - service test for no-op event cancellation when there are no confirmed tickets
  - controller metadata test proving `event.cancelled` is bound to the tickets-service handler
  - controller forwarding test for the event cancellation payload

## Verification Evidence

- Focused tickets-service tests:
  - `pnpm exec jest --runInBand apps/tickets-service/src/tickets-service.service.spec.ts apps/tickets-service/src/tickets-service.controller.spec.ts`
  - 2 suites passed, 18 tests passed.
- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 16 suites passed, 73 tests passed.
- Backend compile:
  - `pnpm build`
  - Nest build passed.
- Frontend lint:
  - `pnpm lint` in `client`
  - Passed.
- Frontend typecheck:
  - `pnpm exec tsc --noEmit` in `client`
  - Passed.
- Service e2e health checks:
  - `pnpm exec jest --runInBand --testRegex '.*e2e-spec\\.ts$'`
  - 5 suites passed, 5 tests passed.
- Frontend production build:
  - `pnpm build` in `client`
  - Next.js build passed.
- Browser E2E:
  - `pnpm exec playwright test --workers=1` in `client`
  - 16 tests passed.
- Diff hygiene:
  - `git diff --check`
  - Passed.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.
  - Confirmed no listener remained on port `4000`.

## Remaining Gaps

- Auto-cancellation currently covers confirmed tickets only. Checked-in tickets are intentionally not reversed.
- Ticket auto-cancellation is tested at service/controller level. Live Kafka/Postgres E2E remains intentionally pending while Docker is removed.
- Purchase enforcement is still read-then-insert without database-level locking; concurrent live purchases could race in a production system.
- City is still derived from free-text venue/location rather than a dedicated `city` field.
- Categories are still inferred from title/description and fallback index.
- Checkout remains intentionally simple: no seat map, payment provider, showtime variants, or ticket tiers.
- DevOps showcase work remains intentionally out of scope until the user approves the product/demo surface.

## Pass Score

98 / 100

This pass closes the last major product/Kafka gap from the demo script: event cancellation now drives downstream ticket cancellation without exposing Kafka in the customer UI. The score is capped because live Kafka/Postgres verification is still deferred while Docker is intentionally absent.
