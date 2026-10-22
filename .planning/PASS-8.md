# Pass 8 - Kafka Cancellation Contract Hardening

## Goal

Make Evento's cancellation flows more credible for a microservices resume project by turning cancellation Kafka events into useful domain events and proving notification consumers handle them without Docker.

## Scope Completed

- Strengthened `ticket.cancelled` events from `tickets-service`.
  - Payload now includes ticket, customer, event, quantity, total price, ticket code, and timestamp context.
  - The service resolves the customer email and event details before updating the ticket.
  - Cancellation now fails before mutation if the customer or event cannot be resolved.
- Strengthened `event.cancelled` events from `events-service`.
  - Payload now includes event title, date, location, organizer id, organizer email, and timestamp.
  - The service resolves organizer email before updating the event.
  - Cancellation now fails before mutation if the organizer cannot be resolved.
- Added `event.cancelled` consumption in `notifications-service`.
  - Controller now binds `KAFKA_TOPICS.EVENT_CANCELLED`.
  - Service sends organizer cancellation email when `organizerEmail` exists.
  - Service skips explicitly with `missing_email` rather than using fake recipients.
- Improved ticket cancellation emails.
  - Emails now include event title, ticket code, quantity, and formatted total when available.
- Added no-Docker contract tests for producer and consumer behavior.
  - `tickets-service` rich `ticket.cancelled` payload and failure branches.
  - `events-service` rich `event.cancelled` payload and missing organizer branch.
  - `notifications-service` controller topic binding and forwarding.
  - `notifications-service` email content and skip behavior.
- Ran two read-only agents:
  - Kafka cancellation contract audit.
  - Jest/Playwright test coverage audit.
  - Their recommendations were applied for the producer and consumer contract tests.

## Verification Evidence

- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 53 tests passed.
- Service e2e health checks:
  - `pnpm exec jest --runInBand --testRegex '.*e2e-spec\\.ts$'`
  - 5 suites passed, 5 tests passed.
- Backend compile:
  - `pnpm build`
  - Nest build completed successfully.
- Frontend lint:
  - `pnpm lint` in `client`
  - ESLint completed successfully.
- Frontend compile:
  - `pnpm build` in `client`
  - Next.js production build completed successfully.
- Browser E2E:
  - `pnpm exec playwright test --workers=1` in `client`
  - 12 tests passed.
- Placeholder cleanup scan:
  - `rg "Hello World|hello world|demo|dummy|user@example|Your Event|UI Smoke|KAfka|Next\\.js logo|Deploy Now|Templates|Learning|Renault|Vercel" apps libs client/src client/README.md client/Design.md -S`
  - No matches.
- Diff hygiene:
  - `git diff --check`
  - No whitespace errors.
- Docker/runtime verification:
  - `docker ps -a --filter "name=eventoapp" --format '{{.Names}}'`
  - No Evento containers found.
  - `lsof -nP -iTCP:4000 -sTCP:LISTEN`
  - No listener on port `4000`.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.

## Agent Findings Applied

- The Kafka contract audit recommended self-contained cancellation event payload assertions for `ticket.cancelled` and `event.cancelled`.
- The test audit recommended negative tests for missing user/event/organizer lookup branches.
- Both agents recommended event cancellation notification binding and service tests. These were added.

## Remaining Gaps

- `event.cancelled` currently notifies the organizer, not every ticket holder.
- Event cancellation does not automatically cancel existing tickets. That would require a tickets-service consumer or orchestration workflow and should not be claimed in a demo yet.
- `ticket.checked-in` is still emitted but not consumed by another service.
- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is off.
- DevOps showcase work remains intentionally out of scope until product and test surfaces are approved by the user.

## Pass Score

96 / 100

This pass makes Kafka feel meaningfully real without putting infrastructure in the user's face. The score is capped because event cancellation is still an organizer notification, not a full attendee-ticket orchestration flow, and live Kafka verification remains intentionally deferred.
