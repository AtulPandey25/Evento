# Pass 35 - Customer Registration Coverage

## Goal

Close the browser-test gap for the default customer signup path. The suite already proved organizer registration; this pass verifies that ticket buyers can register through the default Customer account type.

## Changes

- Added Playwright coverage for Customer registration from `/register`.
- Verified Customer is selected by default.
- Verified Organizer is not selected by default.
- Verified the submitted registration payload uses `role: USER`.
- Updated living docs to describe customer/organizer registration coverage.

## What The New Test Proves

- The signup screen defaults to the customer journey for ticket buyers.
- Customers can create accounts without manually changing the role selector.
- The registration payload preserves the intended `USER` role.
- Organizer registration remains separately covered by the existing test.

## Verification

Commands:

```bash
pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Product readiness check passed.
- Backend Jest: 18 suites passed, 80 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 27 tests.

## Score

99/100

Customer and organizer signup paths are now both protected in browser coverage. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
