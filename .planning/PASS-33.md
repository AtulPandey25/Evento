# Pass 33 - Sign-Out Session Coverage

## Goal

Strengthen authenticated session behavior before product approval. A live walkthrough should not leave customer tickets or organizer tools visible after sign-out.

## Changes

- Added Playwright coverage for customer sign-out from `/tickets`.
- Added Playwright coverage for organizer sign-out from `/organizer/events`.
- Verified `accessToken` is removed from local storage after sign-out.
- Verified persisted auth state marks the user unauthenticated after sign-out.
- Verified customer wallet content is hidden after sign-out.
- Verified organizer tools are hidden after sign-out.
- Updated living docs to mention sign-out session-clearing coverage.

## What The New Tests Prove

- Customer sign-out clears session state and returns the wallet to a sign-in state.
- Organizer sign-out clears session state and locks organizer-only tools.
- Role-specific surfaces do not remain exposed after auth is cleared.

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
- Playwright role-flow suite passed: 26 tests.

## Score

99/100

Session behavior is now better protected for customer and organizer demos. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
