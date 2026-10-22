# Pass 1 - Ticketing Product Shape

## Goal

Move Evento away from a mixed demo console and toward a resume-ready ticket booking product with distinct customer and organizer surfaces.

## Scope Completed

- Docker runtime removed for now: no `eventoapp-*` containers or project Docker networks were left running during verification.
- Customer surface remains focused on browsing events, selecting ticket quantity, buying tickets, and viewing owned tickets.
- Organizer surface now has dedicated URLs:
  - `/organizer/events` for event creation and publishing.
  - `/organizer/check-in` for venue admission code validation.
  - `/organizer` redirects to `/organizer/events`.
  - `/host` redirects to `/organizer/events` for backward compatibility.
- Kafka is still visible through the System/Ops area, not as the main customer experience.
- Added ticket-service tests for multi-ticket purchases, capacity protection, unpublished-event rejection, and Kafka emission on successful purchase.

## Verification Evidence

- `pnpm exec jest apps/tickets-service/src/tickets-service.service.spec.ts --runInBand`
  - 1 suite passed, 3 tests passed.
- `pnpm exec jest --runInBand`
  - 5 suites passed, 9 tests passed.
- `pnpm build`
  - Nest build completed successfully.
- `pnpm lint` in `client`
  - ESLint completed successfully.
- `pnpm build` in `client`
  - Next.js production build completed successfully.
  - Generated routes included `/organizer`, `/organizer/events`, and `/organizer/check-in`.
- Docker verification:
  - `docker ps -a --filter "name=eventoapp" --format '{{.Names}}'` produced no containers.
  - Project network grep produced no Evento/NestJS project networks.

## Remaining Gaps

- Full browser E2E is not in place yet.
- The backend still needs stronger organizer/customer role enforcement.
- Event and ticket services still need integration tests across API Gateway boundaries.
- The UI is split at the route level, but the shared `EventoConsole` component is still large and should be decomposed in a later pass.
- DevOps showcase work remains intentionally out of scope until the product and test surfaces are approved.

## Pass Score

72 / 100

The pass improved the demo shape and protected the ticket quantity flow with tests. The score is capped because full E2E and backend role boundaries are not finished yet.
