# Pass 20 - Auth Role Clarity

## Goal

Remove auth-screen wording that implied one account can both buy tickets and organize events, so the UI matches the backend role model and is clearer during demos.

## Changes

- Updated the auth layout hero from generic all-in-one account language to explicit customer/organizer workspace language.
- Updated login copy to say users continue to customer tickets or organizer event tools.
- Updated register copy to tell users to select Customer for ticket booking or Organizer for event listings.
- Updated the auth hero support copy to distinguish customer passes from organizer publishing/check-in.
- Added Playwright assertions so the registration page keeps the role-based messaging.

## Verification

- `pnpm lint` in `client/` - passed.
- `pnpm exec tsc --noEmit --pretty false` in `client/` - passed.
- `pnpm exec jest --runInBand` - passed, 16 suites / 75 tests.
- `pnpm build` - passed.
- `pnpm exec jest --runInBand --testRegex '.*e2e-spec.ts$'` - passed, 5 suites / 5 tests.
- `pnpm build` in `client/` - passed.
- `pnpm exec playwright test --workers=1` in `client/` - passed, 17 tests.

## Notes

- The first Playwright attempt during verification failed because it started while `next build` held `.next/lock`. The rerun after build completion passed.

## Score

98 / 100

Remaining gap: a single physical email/password can still sign in as whichever role was selected at registration; role switching is not implemented, which is acceptable for this resume demo.
