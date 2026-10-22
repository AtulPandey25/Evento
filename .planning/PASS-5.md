# Pass 5 - Ticket Wallet and Organizer Pricing Polish

## Goal

Make the customer ticket wallet feel like a real event-ticketing wallet and remove internal cents-based pricing from the organizer event form.

## Scope Completed

- Replaced the fake decorative scan grid in the ticket wallet with a QR code generated from the actual ticket code.
- Added accessible QR image text so browser tests can verify the encoded ticket pass without brittle pixel checks.
- Added wallet summary stats:
  - Ready-for-entry ticket count.
  - Wallet value.
  - Next event date.
- Improved ticket pass content:
  - Human status labels such as `Ready for entry`.
  - Proper singular/plural ticket copy.
  - Purchased and checked-in timestamps when present.
  - A stronger entry-code panel for venue staff.
- Made ticket cancellation loading state per-ticket instead of disabling every wallet item.
- Added cancellation helper copy for tickets that are not cancellable.
- Changed organizer price entry to accept dollars, for example `25.50`, while still sending cents to the API as `2550`.
- Relabeled marketplace capacity from `available seats` to `listed seats` because the API does not yet expose sold/remaining inventory.
- Added `qrcode` and `@types/qrcode` to the client package.
- Extended Playwright E2E to verify:
  - Customer wallet renders ticket details, entry code, formatted price, and QR pass.
  - Organizer decimal price input is converted to cents before posting to the API.

## Verification Evidence

- Client lint:
  - `pnpm lint` in `client`
  - ESLint completed successfully.
- Browser E2E:
  - `pnpm -C client exec playwright test --workers=1`
  - 7 tests passed.
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
  - `git diff --check -- client/src/features/evento-console.tsx client/e2e/evento-role-paths.spec.ts client/package.json client/pnpm-lock.yaml`
  - No whitespace errors.
- Docker/runtime verification:
  - `docker ps -a --filter "name=eventoapp" --format '{{.Names}}'` produced no containers.
  - Project network grep produced no Evento/NestJS project networks.
  - No process remained listening on port `4000`.
- Runtime cleanup:
  - Removed generated `client/playwright-report` and `client/test-results`.

## Agent Findings Applied

- Ticket wallet UX audit found the wallet still felt like a receipt list, the scan area was fake, cancellation loading was global, and organizer pricing exposed cents. These were fixed with a real QR pass, wallet stats, per-ticket cancellation state, and dollar-based price input.
- E2E audit recommended asserting wallet semantics rather than QR pixels, reusing the mocked API envelope pattern, and testing `25.50 -> 2550` conversion. These were added to Playwright coverage.

## Remaining Gaps

- The large shared `EventoConsole` component should still be split into smaller route-specific components.
- Wallet QR is generated client-side from the ticket code; live-stack E2E should later prove real persisted ticket data flows through Postgres/Kafka/API Gateway.
- Marketplace capacity is now honestly labeled as listed seats, but remaining inventory would require API support.
- Live-stack E2E against real Postgres/Kafka/API Gateway remains intentionally pending while Docker is off.
- DevOps showcase work remains intentionally out of scope until the product and test surfaces are approved.

## Pass Score

91 / 100

This pass removes two obvious demo-project tells: fake ticket scanning and cents-based organizer pricing. The score is still capped because live-stack E2E, component decomposition, and DevOps showcase work remain ahead.
