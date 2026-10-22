# Pass 6 - Route Surface Component Decomposition

## Goal

Make the frontend code match the product experience: separate Customer, Ticket Wallet, Organizer, and Operations surfaces instead of one large mixed console component.

## Scope Completed

- Reduced `client/src/features/evento-console.tsx` from 1,423 lines to 339 lines.
- Kept data fetching, mutations, auth state, redirects, and query invalidation in `EventoConsole`.
- Extracted route-focused UI components:
  - `evento/customer-marketplace.tsx`
  - `evento/ticket-wallet.tsx`
  - `evento/organizer-workspace.tsx`
  - `evento/operations-view.tsx`
  - `evento/evento-shell.tsx`
  - `evento/shared.tsx`
- Preserved the existing customer marketplace, ticket wallet, organizer creation, organizer check-in, publish, and ops behavior.
- Tightened `/ops` direct access so the operations/Kafka surface is now admin-only, not just hidden from customer navigation.
- Added E2E coverage for decomposition risk areas:
  - Unauthenticated purchase routes and protected pages.
  - Organizer blocked from customer purchase.
  - Organizer check-in mutation still posts ticket code and auth header.
  - Wallet cancellation posts the correct auth header and disables non-confirmed tickets.
  - Organizer publish posts to the publish endpoint with organizer auth.
  - Customer `/ops` direct access is blocked while ADMIN can see operations/Kafka.

## Verification Evidence

- Client lint:
  - `pnpm lint` in `client`
  - ESLint completed successfully.
- Browser E2E:
  - `pnpm -C client exec playwright test --workers=1`
  - 12 tests passed.
- Full backend unit/integration-style suite:
  - `pnpm exec jest --runInBand`
  - 12 suites passed, 31 tests passed.
- Backend compile:
  - `pnpm build`
  - Nest build completed successfully.
- Client compile:
  - `pnpm build` in `client`
  - Next.js production build completed successfully.
- Diff hygiene:
  - `git diff --check -- client/src/features/evento-console.tsx client/src/features/evento client/e2e/evento-role-paths.spec.ts`
  - No whitespace errors.
- Docker/runtime verification:
  - `docker ps -a --filter "name=eventoapp" --format '{{.Names}}'` produced no containers.
  - Project network grep produced no Evento/NestJS project networks.
  - No process remained listening on port `4000`.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.

## Agent Findings Applied

- Component-boundary audit recommended extracting presentational route surfaces while keeping queries and mutations in the parent container. This was followed to avoid behavior drift.
- E2E risk audit identified weak coverage around route mapping, role gates, publish, wallet cancellation, and ops direct access. The Playwright suite was expanded from 7 tests to 12 tests to cover these seams.

## Remaining Gaps

- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is off.
- Component tests are still absent; Playwright currently carries the frontend regression load.
- Query ownership can be refined later, but keeping queries in the parent was the safer refactor for this pass.
- DevOps showcase work remains intentionally out of scope until the product and test surfaces are approved.

## Pass Score

93 / 100

This pass improves maintainability without changing the user-facing product shape, and the expanded E2E suite now protects the riskiest route and role seams. The score is capped because live-stack E2E and the final DevOps layer are still pending.
