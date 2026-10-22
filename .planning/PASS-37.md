# Pass 37 - API Gateway Auth Forwarding Coverage

## Goal

Protect the customer/organizer role split at the API Gateway boundary. The browser registration UI now has clear Customer and Organizer paths, and the gateway should preserve that intent when forwarding registration requests to the auth service.

## Changes

- Added API Gateway auth-service coverage for organizer registration forwarding with the selected role.
- Added API Gateway auth-service coverage for customer registration forwarding without injecting an organizer role.
- Added API Gateway auth-controller coverage for customer and organizer registration request bodies.
- Updated the README, product status, and interview guide to mention API Gateway auth forwarding tests.

## What The New Tests Prove

- Organizer signup keeps `role: ORGANIZER` when the gateway forwards the request.
- Customer signup can omit `role`, allowing the auth service to apply the default `USER` contract.
- The gateway controller passes registration DTOs through without reshaping the role selection.
- Browser, gateway, and auth-service coverage now agree on the separated customer/organizer signup paths.

## Verification

Commands:

```bash
pnpm exec jest apps/api-gateway/src/auth/auth.service.spec.ts apps/api-gateway/src/auth/auth.controller.spec.ts --runInBand
pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Targeted API Gateway auth specs passed: 2 suites, 4 tests.
- Product readiness check passed.
- Backend Jest: 19 suites passed, 84 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 27 tests.

## Score

99/100

The customer/organizer auth boundary is now protected from browser flow through gateway forwarding and auth-service role defaults. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
