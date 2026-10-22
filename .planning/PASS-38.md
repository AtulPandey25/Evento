# Pass 38 - Organizer Route Language Cleanup

## Goal

Remove the old host wording from the frontend route model so the product consistently presents Customer and Organizer roles. The demo should feel like a ticketing platform with organizer workspaces, not a generic hosting console.

## Changes

- Renamed the internal organizer view id from `host` to `organizer`.
- Removed the obsolete `/host` route alias.
- Kept `/organizer`, `/organizer/events`, and `/organizer/check-in` as the only organizer route language.
- Added a product readiness guard that rejects the old `/host` page if it returns.

## What The Change Proves

- The customer navigation still hides organizer and ops routes for customer accounts.
- Organizer accounts still reach listing management and check-in routes.
- The production route list no longer includes `/host`.
- The product readiness gate now protects the organizer naming model.

## Verification

Commands:

```bash
pnpm run verify:product
pnpm -C client exec tsc --noEmit --pretty false
pnpm verify
```

Result:

- Product readiness check passed.
- Client TypeScript check passed after clearing stale Next route metadata.
- Backend Jest: 19 suites passed, 84 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed in the full gate.
- Client lint passed.
- Next.js production build passed and listed 12 app routes with no `/host` route.
- Playwright role-flow suite passed: 27 tests.

## Score

99/100

The UI language is cleaner and the organizer surface is now consistently named. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
