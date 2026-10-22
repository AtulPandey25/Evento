# Pass 55 - Event Detail Checkout Focus

## Goal

Make `/events/[eventId]` feel more like a focused ticket checkout step and less like another information dashboard.

## Changes

- Collapsed the left-side event-detail cards into one cleaner show summary inside the poster panel.
- Removed the separate `Entry rules` panel and replaced it with a compact `Mobile entry pass` strip.
- Kept the sticky checkout panel as the primary action area for ticket type, quantity, total, and confirmation.
- Added browser coverage for the new mobile entry pass copy so the streamlined checkout detail remains intentional.
- Updated the demo script to point reviewers at the compact show summary and mobile entry pass notes.

## What The Tests Prove

- Event detail checkout still loads from the customer marketplace.
- Seat availability, booked count, realistic INR pricing, convenience-fee copy, and multi-ticket booking still render.
- The compact mobile entry pass information is visible in the checkout flow.
- Booking still posts the selected quantity with the customer auth header and lands in the wallet confirmation flow.

## Verification

Commands:

```bash
pnpm -C client exec tsc --noEmit --pretty false
pnpm -C client lint
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3999 pnpm -C client build
PLAYWRIGHT_PORT=4010 PLAYWRIGHT_SKIP_BUILD=1 pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Product readiness check passed.
- Backend Jest: 19 suites passed, 94 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 32 tests.

## Score

98/100

The event detail route now gives the booking panel more visual priority while preserving all customer purchase behavior. The remaining points are reserved for user product approval and the later real-runtime DevOps layer.
