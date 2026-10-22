# Pass 61 - Pre-DevOps Approval Guard

## Goal

Prevent accidental DevOps work before explicit product approval.

## Changes

- Added `scripts/check-devops-approval.mjs`.
- Added `scripts/check-devops-approval.test.mjs`.
- Extended `verify:product` to run seed tests, the seed dry-run, DevOps approval tests, and the DevOps approval gate.
- Documented the `.planning/DEVOPS-APPROVED.md` marker in the approval packet and product status/checklist.
- Broadened the gate to cover CI/CD, Docker/runtime, Terraform/IaC, Kubernetes/Helm, and deployment docs/scripts.
- Updated docs to describe the product gate as a pre-DevOps artifact guard.

## What The Tests Prove

- DevOps artifact detection covers GitHub Actions, GitLab CI, Jenkins, CircleCI, Buildkite, Azure Pipelines, Bitbucket Pipelines, Docker, Compose, Terraform, tfvars, Kubernetes, Helm, kustomize, skaffold, deployment folders, deploy scripts, and deployment docs.
- Product docs/source files are not falsely flagged.
- DevOps artifacts are blocked until `.planning/DEVOPS-APPROVED.md` exists.
- With no approval marker and no DevOps artifacts present, the repository remains in the product-approval phase.

## Verification

- `node --test scripts/check-devops-approval.test.mjs`
  - DevOps approval tests passed: 4 tests.
- `node scripts/check-devops-approval.mjs`
  - DevOps approval gate passed.
- `pnpm run verify:product`
  - Product readiness check passed.
  - Seed and DevOps approval tests passed: 11 tests.
  - Showcase dry-run passed.
  - DevOps approval gate passed.
- `pnpm verify`
  - Product readiness check passed.
  - Seed and DevOps approval tests passed: 11 tests.
  - Showcase dry-run passed.
  - DevOps approval gate passed.
  - Backend Jest passed: 20 suites, 96 tests.
  - Backend service e2e passed: 5 suites, 5 tests.
  - Nest build passed.
  - Client TypeScript check passed.
  - Client lint passed.
  - Next.js production build passed.
  - Playwright passed: 33 tests.

## Score

99/100

Remaining gap: final DevOps work is still intentionally gated until product approval.
