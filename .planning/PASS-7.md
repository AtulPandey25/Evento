# Pass 7 - Kafka Notification Contracts and Scaffold Cleanup

## Goal

Make Evento feel less like a generated project and more like a coherent ticketing platform by tightening Kafka notification data, removing scaffold leftovers, and proving the main role flows still work.

## Scope Completed

- Strengthened the `ticket.purchased` Kafka payload so ticket purchases now include:
  - `eventTitle`
  - `userEmail`
  - `quantity`
  - `totalPrice`
  - `ticketCode`
- Added a user lookup in `tickets-service` before purchase creation so notifications are sent to the real account email instead of a fake fallback.
- Removed notification fallbacks such as `user@example.com` and generic event titles. Missing recipient data now returns an explicit skipped result with reason `missing_email`.
- Added notification unit coverage:
  - Notification controller health and Kafka topic metadata.
  - Ticket purchase email content and real recipient handling.
  - Missing-recipient skip behavior.
  - Cancellation email behavior.
  - Nodemailer transport setup and error swallowing.
- Added service health endpoints for:
  - `auth-service`
  - `events-service`
  - `tickets-service`
  - existing `notifications-service`
- Replaced generated `Hello World!` service e2e tests with real `/health` checks.
- Removed scaffold/template project tells:
  - `Hello World!` from app/test code.
  - `KAfka` startup typo.
  - create-next-app frontend README.
  - unrelated Renault design document.
- Added an Evento-specific frontend README and design direction doc.
- Set `turbopack.root` in `client/next.config.ts` to remove the multi-lockfile root warning from Next.js builds.
- Improved Playwright API mocks so organizer event creation is tested on the same `/events` endpoint shape as the real gateway.

## Verification Evidence

- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 45 tests passed.
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

- Kafka audit found fake notification fallbacks and thin ticket payloads. This pass made ticket purchase events self-contained for purchase emails and removed fake fallback recipients.
- Notification test audit recommended no-Docker controller/service/email specs. This pass added those focused tests.
- Scaffold e2e audit flagged `Hello World!` checks. This pass replaced them with real service health checks.

## Remaining Gaps

- Event lifecycle topics are still not fully consumed by notifications. `event.cancelled` and `ticket.checked-in` can become stronger showcase points in a later pass.
- `ticket.cancelled` still lacks enough event/customer context for a full cancellation email from Kafka alone.
- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is off.
- DevOps showcase work remains intentionally out of scope until the product and test surfaces are approved by the user.

## Pass Score

95 / 100

This pass removes several resume-project credibility issues and makes the Kafka notification path materially more real and testable. The score is still capped because live-stack verification and full event lifecycle consumers remain ahead.
