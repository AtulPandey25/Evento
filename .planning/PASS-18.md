# Pass 18 - Kafka Notification Polish

## Goal

Make the Kafka-backed notification story consistent with the BookMyShow-style product surface by aligning ticket emails with INR pricing, event context, and cancellation reason.

## Changes

- Added shared INR money formatting in `notifications-service`.
- Updated ticket purchase emails to show INR totals plus event date and venue from the `ticket.purchased` Kafka payload.
- Updated ticket cancellation emails to show INR totals, event date, and venue.
- Added event-cancellation-specific ticket email copy so auto-cancelled attendee tickets do not say the customer requested the cancellation.
- Updated ticket check-in emails to include event date and venue when Kafka supplies them.
- Extended notification controller payload typings for ticket cancellation/check-in event context.
- Extended `ticket.purchased` Kafka payloads with event date and venue.
- Added focused tests for INR formatting, event venue/date propagation, and event-cancelled email copy.

## Verification

- `pnpm exec jest --runInBand apps/notifications-service/src/notifications-service.service.spec.ts apps/notifications-service/src/notifications-service.controller.spec.ts apps/tickets-service/src/tickets-service.service.spec.ts` - passed, 3 suites / 34 tests.
- `pnpm exec jest --runInBand` - passed, 16 suites / 75 tests.
- `pnpm build` - passed.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm lint` in `client/` - passed.
- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm build` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 17 tests.

## Score

98 / 100

Remaining gap: notification behavior is verified at service/contract level without live Kafka broker delivery while Docker/Kafka orchestration remains intentionally removed.
