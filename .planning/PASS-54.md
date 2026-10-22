# Pass 54 - Marketplace Demo Polish

## Goal

Make the customer marketplace feel more like a polished ticket-booking browse page and less like a mixed admin/product dashboard.

## Audit Input

The UI review identified visual density as the dominant product risk: the marketplace had the right ticketing features, but too many equal-weight controls and customer-facing metrics made it feel busier than a consumer booking surface. Screenshot inspection also showed mock prices such as `INR 15.00`, which looked unrealistic for an Indian ticketing demo.

The integration review also flagged that live Docker/runtime verification is intentionally deferred. This pass stays within the approved product layer and keeps the mocked no-Docker verification gate intact.

## Changes

- Removed the customer-facing `Refresh` button from `/events`; the browse page now keeps only user-meaningful filter reset controls.
- Simplified event cards by removing the duplicate date badge and demoting internal `Sold tickets` data from the customer card surface.
- Kept the customer card hierarchy focused on poster, title, date, venue, seat availability, price, and `Book now`.
- Updated Playwright fixture prices to realistic INR minor-unit values:
  - `Launch Night`: INR 1,500.00
  - `Design Workshop`: INR 2,500.00
  - `Draft Circle`: INR 2,550.00
  - Wallet total: INR 4,500.00 for 3 tickets
- Added/updated browser assertions so realistic INR prices remain covered by E2E tests.
- Updated the demo script to describe realistic INR prices and customer-facing seat availability instead of sales metrics.

## What The Tests Prove

- Public entry still opens the ticket marketplace.
- Customer marketplace filtering, category selection, date filtering, and price sorting still work after card simplification.
- Event detail checkout still displays realistic ticket prices and supports multi-ticket booking.
- Wallet and organizer manifest totals render the realistic INR ticket amount.
- Organizer event creation still converts organizer-entered rupee prices into backend minor units.

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

The customer browse surface is cleaner and the demo data is more credible. The remaining points are reserved for user product approval and the later real-runtime DevOps layer.
