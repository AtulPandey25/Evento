# Pass 36 - Auth Role Contract Coverage

## Goal

Make the backend auth contract match the strengthened browser registration coverage. Customer and organizer signup are central to the separated product experience, so both paths should be protected at service and browser levels.

## Changes

- Added an auth-service unit test for default customer registration when no role is provided.
- Verified the auth service persists `role: USER` for default registration.
- Verified `user.registered` Kafka payloads include the default customer role.
- Kept existing organizer registration service coverage intact.
- Updated living docs to mention customer/organizer auth role contract tests.

## What The New Test Proves

- The backend defaults registration to `USER` when the client does not send a role.
- The returned registration response preserves the customer role.
- Kafka registration events include the same customer role used by the stored user.
- Browser and backend coverage now agree on the default customer signup path.

## Verification

Commands:

```bash
pnpm exec jest apps/auth-service/src/auth-service.service.spec.ts --runInBand
pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Targeted auth-service spec passed: 5 tests.
- Product readiness check passed.
- Backend Jest: 18 suites passed, 81 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 27 tests.

## Score

99/100

The auth role split is now protected from UI through service contract. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
