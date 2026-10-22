# Pass 42 - Organizer Listing Preview

## Goal

Make organizer event creation feel more like preparing a ticket listing for sale. The organizer should see a live preview and publish-readiness signal while filling title, venue, city, category, seats, and price.

## Changes

- Added a live `Listing preview` region to the organizer create/edit listing panel.
- Added a publish-readiness count that tracks completed listing fields.
- Preview now shows category, price, title, date, venue/city, and seat count before the draft is created.
- Updated organizer create-listing Playwright coverage to assert preview updates and readiness.
- Updated product docs and product readiness checks to include the listing preview.

## What The Change Proves

- Organizer creation reads as listing preparation, not generic CRUD.
- The demo can show how an organizer checks sale readiness before creating a draft.
- The preview remains protected by browser coverage and the product readiness guard.

## Verification

Commands:

```bash
pnpm -C client exec tsc --noEmit --pretty false
pnpm -C client exec playwright test -g "organizer create-listing path" --workers=1
pnpm verify
```

Result:

- Client TypeScript check passed.
- Targeted organizer create-listing Playwright test passed.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 84 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed in the full gate.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed in the full gate: 31 tests.

## Score

99/100

The organizer creation flow now has a clearer ticket-listing preparation moment. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
