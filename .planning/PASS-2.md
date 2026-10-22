# Pass 2 - Real Customer and Organizer Roles

## Goal

Make Customer vs Organizer more than a UI label. The backend, JWT, gateway forwarding, ticketing rules, and main UI navigation should now agree on the user's role.

## Scope Completed

- Registration accepts `USER` or `ORGANIZER`.
- Auth service persists the selected role and includes it in `user.registered` Kafka payloads.
- Login signs JWTs with `role`.
- API Gateway now owns its local JWT strategy and preserves `req.user.role`.
- API Gateway forwards `x-user-role` to events and tickets services.
- Events service blocks customers from creating, updating, publishing, or cancelling event inventory.
- Tickets service blocks organizers/admins from purchasing customer tickets.
- Tickets service blocks customers from venue check-in and event-ticket inspection.
- Organizer check-in still allows the owning organizer and allows `ADMIN`.
- Register UI now has an account type selector.
- Login redirects organizers to `/organizer/events` and customers to `/events`.
- Customer nav hides Organizer for non-organizer users.
- System/Ops link is hidden unless the signed-in user is `ADMIN`.
- Organizer pages show an access-required state for non-organizers.
- Organizer form no longer ships with prefilled fake event data.

## Verification Evidence

- Focused backend role specs:
  - `pnpm exec jest apps/auth-service/src/auth-service.service.spec.ts apps/api-gateway/src/jwt.strategy.spec.ts apps/events-service/src/events-service.service.spec.ts apps/tickets-service/src/tickets-service.service.spec.ts --runInBand`
  - 4 suites passed, 15 tests passed.
- Full backend unit suite:
  - `pnpm exec jest --runInBand`
  - 7 suites passed, 18 tests passed.
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

- Backend role audit found fragile gateway JWT role propagation, missing role checks on event mutations, and missing role checks around ticket check-in. These were fixed.
- Frontend role audit found registration-only role UX and role-blind navigation. Login routing, nav visibility, organizer access state, and customer-facing empty copy were updated.
- Test audit confirmed no-Docker Jest is the right Pass 2 verification path and identified Playwright/mocked browser E2E as the next practical client test layer.

## Remaining Gaps

- Full browser E2E is still not installed.
- API Gateway controller/service forwarding tests are still useful future coverage.
- Backend e2e configs still need monorepo alias mapping before they can run cleanly.
- Direct service spoofing is still possible if downstream services are exposed and trust `x-user-*` headers; this should be handled when Docker/Kubernetes work resumes.
- `USER` remains the database enum value for the customer role to avoid a migration in this pass.

## Pass Score

80 / 100

The role model now works across auth, gateway, backend services, and the primary UI. The score is capped because browser E2E and full gateway integration tests are still pending.
