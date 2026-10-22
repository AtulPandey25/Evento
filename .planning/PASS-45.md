# Pass 45 - Attendee-Aware Booking Manifest

## Goal

Make the organizer booking manifest useful for a ticketing demo. Organizers should see attendee identity alongside ticket code, quantity, status, and order value instead of only raw ticket rows.

## Changes

- Updated `tickets-service` event-ticket listing to join users and return attendee name and email.
- Added `userName` and `userEmail` to the frontend event-ticket summary type.
- Updated the organizer booking manifest UI to show attendee name and email before ticket metadata.
- Updated browser fixtures and Playwright manifest coverage to assert attendee identity.
- Updated product docs and product readiness checks to include attendee-aware manifests.

## What The Change Proves

- Organizer manifests show who bought tickets, not just ticket codes.
- The backend manifest contract returns attendee identity for the owning organizer.
- The browser demo verifies attendee name, email, ticket code, quantity, and order value.

## Verification

Commands:

```bash
pnpm exec jest apps/tickets-service/src/tickets-service.service.spec.ts --runInBand
pnpm -C client exec playwright test -g "organizer views event booking manifest" --workers=1
pnpm verify
```

Result:

- Targeted ticket-service spec passed: 21 tests.
- Targeted organizer manifest Playwright test passed.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 90 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 31 tests.

## Score

99/100

The organizer manifest now reads like a real ticketing operations view. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
