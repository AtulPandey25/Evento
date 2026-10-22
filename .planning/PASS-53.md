# Pass 53 - Fresh Playwright Verification Server

## Goal

Make the full verification gate reliable after a transient Playwright web-server failure exposed a stale Next.js server reuse path.

## Root Cause

The root `verify:client` command already built the Next.js client before Playwright, while `client/playwright.config.ts` could also build and start the app. After changing Playwright to skip its duplicate build, local runs could still reuse an old server on port `4000`. That stale server served an outdated bundle, so browser tests failed even though the freshly built code was correct.

## Changes

- Kept `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3999` on the explicit client production build so Playwright mocks match the compiled client bundle.
- Made the Playwright app port configurable with `PLAYWRIGHT_PORT`.
- Changed the root client gate to run Playwright on isolated port `4010`.
- Made Playwright server reuse opt-in with `PLAYWRIGHT_REUSE_SERVER=1` instead of defaulting to reuse during verification.
- Kept direct Playwright runs self-contained: without `PLAYWRIGHT_SKIP_BUILD`, Playwright can still build and start the client itself.

## What The Tests Prove

- The root client verification path no longer depends on a previously running `next-server`.
- The Next production build and Playwright API mocks use the same API base URL.
- Customer, organizer, admin, auth, booking, wallet, manifest, cancellation, check-in, and mobile role flows still pass in the browser.

## Verification

Commands:

```bash
pnpm run verify:client
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

99/100

The local no-Docker verification gate is now more deterministic and better suited for repeated product passes. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
