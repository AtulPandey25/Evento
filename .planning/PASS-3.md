# Pass 3 - No-Docker Integration and Browser E2E

## Goal

Add stronger integration and end-to-end confidence without restarting Docker. Prove that the API Gateway role plumbing works and that the main Customer/Organizer browser flows send the expected API calls.

## Scope Completed

- Added API Gateway controller specs for role forwarding:
  - Events create, update, publish, cancel.
  - Ticket purchase, check-in, event-ticket listing.
- Added API Gateway service specs for downstream HTTP role headers:
  - Auth registration forwards selected role.
  - Events service forwards `x-user-id` and `x-user-role`.
  - Tickets service forwards `x-user-id` and `x-user-role`.
- Added Playwright to the client.
- Added mocked browser E2E tests:
  - Registration submits selected `ORGANIZER` role.
  - Customer increases quantity and purchases 2 tickets with auth header.
  - Organizer checks in a ticket code with auth header.
- Playwright runs with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3999` so tests do not accidentally call the real gateway.

## Verification Evidence

- Gateway focused specs:
  - `pnpm exec jest apps/api-gateway/src/auth/auth.service.spec.ts apps/api-gateway/src/events/events.service.spec.ts apps/api-gateway/src/tickets/ticket.service.spec.ts apps/api-gateway/src/events/events.controller.spec.ts apps/api-gateway/src/tickets/ticket.controller.spec.ts apps/api-gateway/src/jwt.strategy.spec.ts --runInBand`
  - 6 suites passed, 15 tests passed.
- Full backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 12 suites passed, 31 tests passed.
- Browser E2E:
  - `pnpm -C client exec playwright test`
  - 3 tests passed.
- Backend compile:
  - `pnpm build`
  - Nest build completed successfully.
- Client lint:
  - `pnpm lint` in `client`
  - ESLint completed successfully.
- Client compile:
  - `pnpm build` in `client`
  - Next.js production build completed successfully.
- Docker runtime verification:
  - `docker ps -a --filter "name=eventoapp" --format '{{.Names}}'` produced no containers.
  - Project network grep produced no Evento/NestJS project networks.

## Agent Findings Applied

- Gateway audit confirmed controller/JWT specs were present and recommended service-level specs for HTTP header forwarding. These were added.
- Client E2E audit recommended isolating browser tests from the real API on `127.0.0.1:3999`, using gateway response envelopes, and seeding both Zustand auth storage plus `accessToken`. These were applied.

## Remaining Gaps

- Full live-stack E2E against real Postgres/Kafka/API Gateway remains pending because Docker is intentionally off.
- Existing Nest e2e configs still need alias mapping and real specs before they are useful.
- More browser E2E can be added for organizer event creation/publish and customer ticket wallet rendering.
- Visual polish is still not BookMyShow-level; the next product pass should focus on page composition and ticketing-marketplace feel.

## Pass Score

86 / 100

This pass adds meaningful no-Docker E2E and gateway integration coverage. The score is capped because live-stack E2E and deeper visual polish are still pending.
