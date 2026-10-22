# Pass 9 - Demo Documentation and Check-In Risk Fix

## Goal

Make Evento easier to present as a resume project by adding accurate root documentation, a focused interview demo script, and fixing a backend check-in risk found during the demo audit.

## Scope Completed

- Added a root `README.md` that explains:
  - Product pitch.
  - Customer and organizer roles.
  - Current Docker pause.
  - Microservice architecture.
  - Service responsibilities and ports.
  - Frontend routes.
  - Feature flows.
  - API Gateway route surface.
  - Kafka topics and notification consumers.
  - Local setup commands.
  - Quality gates.
  - DevOps roadmap.
  - Honest caveats for demo claims.
- Added `docs/DEMO-SCRIPT.md`.
  - 5-8 minute interview walkthrough.
  - Customer marketplace first.
  - Organizer create/publish flow.
  - Customer booking and wallet flow.
  - Organizer check-in flow.
  - Kafka/notification story.
  - Testing story.
  - DevOps roadmap close.
  - What not to claim yet.
- Linked frontend README back to root docs and demo script.
- Ran two read-only doc/demo agents:
  - Root README audit.
  - Demo walkthrough audit.
  - Applied their recommendations for API surface, setup commands, Kafka caveats, admin-only `/ops`, and publish-notification caveat.
- Fixed a real tickets-service check-in risk found by the demo audit:
  - Check-in ticket lookup now reads `tickets.eventId` instead of referencing `events.id` without joining `events`.
  - Added an explicit `Event not found` guard before organizer ownership check.
  - Added regression coverage for missing event during check-in.

## Verification Evidence

- Focused check-in regression:
  - `pnpm exec jest apps/tickets-service/src/tickets-service.service.spec.ts --runInBand`
  - 1 suite passed, 11 tests passed.
- Backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 15 suites passed, 54 tests passed.
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
  - `rg "Hello World|hello world|dummy|user@example|Your Event|UI Smoke|KAfka|Next\\.js logo|Deploy Now|Templates|Learning|Renault|Vercel" apps libs client/src client/README.md client/Design.md README.md docs -S`
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

- README audit requested architecture, service table, API surface, setup commands, quality gates, Kafka caveats, and DevOps roadmap. These were added to the root README.
- Demo audit requested a customer-first walkthrough and clear caveats around Docker, publish notifications, admin-only `/ops`, event cancellation, and payments. These were added.
- Demo audit identified a check-in backend risk. The service implementation and unit test were fixed.

## Remaining Gaps

- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is off.
- Event cancellation still does not automatically cancel attendee tickets.
- `ticket.checked-in` is emitted but not consumed by another service.
- Publishing an event does not currently emit a notification-oriented Kafka event.
- DevOps showcase work remains intentionally out of scope until the user approves the product/demo surface.

## Pass Score

97 / 100

This pass makes the project much easier to demo and fixes a backend issue that could have undermined the organizer check-in story. The score is still capped because live-stack verification and the final DevOps layer are intentionally pending.
