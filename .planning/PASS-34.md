# Pass 34 - Repo-Wide No-Docker Guard

## Goal

Strengthen the "Docker removed for now" rule before product approval. Docker artifacts should not come back anywhere in the repository until the user approves the final DevOps phase.

## Changes

- Updated `scripts/check-product-readiness.mjs` to scan the repository for Docker artifacts, not only root files.
- Ignored generated/dependency directories such as `.git`, `.next`, `dist`, `coverage`, `node_modules`, `playwright-report`, and `test-results`.
- Added filename guards for `.dockerignore`, `Dockerfile`, `Dockerfile.*`, `*.Dockerfile`, `docker-compose.yaml`, `docker-compose.yml`, `compose.yaml`, and `compose.yml`.
- Updated living docs to describe the repo-wide Docker artifact guard.
- Fixed a Playwright timing weakness in the customer ticket cancellation test by polling for the mocked cancellation request header.

## Evidence

Initial repository scan found no Docker artifacts outside ignored dependency/build output.

## Verification

Commands:

```bash
pnpm run verify:product
pnpm -C client exec playwright test --workers=1
pnpm verify
```

Result:

- Product readiness check passed with repo-wide Docker artifact scanning.
- Backend Jest: 18 suites passed, 80 tests passed.
- Backend service e2e: 5 suites passed, 5 tests passed.
- Nest build passed.
- Client TypeScript check passed.
- Client lint passed.
- Next.js production build passed.
- Playwright role-flow suite passed: 26 tests.

## Score

99/100

The no-Docker pre-approval rule is now enforced repo-wide. The final 1 point remains gated on user product approval and the later DevOps/runtime phase.
