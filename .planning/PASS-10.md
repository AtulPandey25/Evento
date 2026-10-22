# Pass 10 - Kafka Publish and Check-In Lifecycle

## Goal

Strengthen the Kafka story without making the UI feel like an infrastructure dashboard by adding useful lifecycle events for event publishing and ticket check-in.

## Scope Completed

- Added `event.published` to Kafka topics.
- Updated `events-service.publish()`:
  - Resolves organizer email before publishing.
  - Emits a self-contained `event.published` event with event and organizer context.
  - Fails before mutation if organizer email cannot be resolved.
- Updated `tickets-service.checkIn()`:
  - Keeps the fixed `tickets.eventId` lookup from Pass 9.
  - Resolves customer email before check-in update.
  - Emits a self-contained `ticket.checked-in` event with ticket, event, customer, quantity, and timestamp context.
  - Fails before mutation if event or customer cannot be resolved.
- Added notification consumers:
  - `event.published` -> organizer publish confirmation email.
  - `ticket.checked-in` -> customer check-in confirmation email.
- Added no-Docker contract tests:
  - Event publish producer payload and missing-organizer branch.
  - Ticket check-in producer payload and missing-customer branch.
  - Notification controller Kafka topic bindings and forwarding for `event.published` and `ticket.checked-in`.
  - Notification service send/skip behavior for event publish and ticket check-in emails.
- Updated docs and ops UI topic list:
  - Root README now includes `event.published`.
  - Demo script now explains publish/check-in notification flows accurately.
  - `/ops` Kafka topic list now includes `event.published`.
- Ran two read-only agents:
  - Lifecycle Kafka contract audit.
  - Lifecycle test coverage audit.
  - Applied their recommendations for payloads, assertions, and docs.

## Verification Evidence

- Targeted lifecycle contract specs:
  - `pnpm exec jest apps/events-service/src/events-service.service.spec.ts apps/tickets-service/src/tickets-service.service.spec.ts apps/notifications-service/src/notifications-service.controller.spec.ts apps/notifications-service/src/notifications-service.service.spec.ts --runInBand`
  - 4 suites passed, 37 tests passed.
- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 63 tests passed.
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
- Placeholder/stale-copy scan:
  - `rg "Hello World|hello world|dummy|user@example|Your Event|UI Smoke|KAfka|Next\\.js logo|Deploy Now|Templates|Learning|Renault|Vercel|does not currently send a notification|ticket\\.checked-in.*not consumed|Publish sends customer notifications" apps libs client/src client/README.md client/Design.md README.md docs -S`
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

- Lifecycle audit recommended keeping publish notification as an organizer "your listing is live" email, not a customer blast. This was followed.
- Test audit recommended richer check-in fixture data, missing-user branch coverage, publish payload assertions, notification binding tests, and service send/skip tests. These were added.
- Documentation audit recommendations were carried forward by removing stale publish/check-in caveats and updating the Kafka topic list.

## Remaining Gaps

- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is off.
- Event cancellation still does not automatically cancel attendee tickets.
- Publishing an event sends organizer confirmation only; customer-facing publish notifications are not implemented.
- Real payment processing remains out of scope.
- DevOps showcase work remains intentionally out of scope until the user approves the product/demo surface.

## Pass Score

98 / 100

This pass closes the main Kafka storytelling gaps while preserving the product-first UI. The score is still capped because live-stack verification and the final DevOps layer remain intentionally pending.
