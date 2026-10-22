# Pass 31 - Login Role Routing Coverage

## Goal

Strengthen the customer/organizer separation around the auth entry point. The login page already routes users by role; this pass makes that behavior part of the browser verification suite.

## Changes

- Added Playwright coverage for customer login routing to `/events`.
- Added Playwright coverage for organizer login routing to `/organizer/events`.
- Verified login request payloads for both roles.
- Verified persisted access tokens for both roles.
- Verified role-specific navigation after login.
- Updated living docs to call out login role-routing coverage.

## What The New Tests Prove

- Customer accounts land in the ticket marketplace after login.
- Customer navigation exposes ticketing surfaces without organizer links.
- Organizer accounts land in the organizer workspace after login.
- Organizer navigation exposes event management and check-in without customer wallet links.
- The auth store persists the returned access token for authenticated API calls.

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
- Playwright role-flow suite passed: 23 tests.

## Score

99/100

The auth entry point is now better protected for the product demo. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
