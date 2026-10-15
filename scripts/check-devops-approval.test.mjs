import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findPrematureDevOpsArtifacts,
  isDevOpsArtifact,
} from './check-devops-approval.mjs';

test('isDevOpsArtifact detects gated CI, Docker, Terraform, Kubernetes, and Helm files', () => {
  for (const filePath of [
    '.github/workflows/ci.yml',
    'Dockerfile',
    'apps/api/Dockerfile',
    'docker-compose.yaml',
    'docker-compose.local.yml',
    'docker/api/Dockerfile',
    '.gitlab-ci.yml',
    'Jenkinsfile',
    '.circleci/config.yml',
    '.buildkite/pipeline.yml',
    'azure-pipelines.yml',
    'bitbucket-pipelines.yml',
    'terraform/main.tf',
    'terraform/dev.tfvars',
    '.terraform.lock.hcl',
    'infra/main.tf',
    'infrastructure/app.tf',
    'infra/terraform/variables.tf',
    'k8s/api.yaml',
    'k8s/kustomization.yaml',
    'skaffold.yaml',
    'kubernetes/deployment.yml',
    'helm/evento/Chart.yaml',
    'charts/evento/values.yaml',
    'charts/evento/values-dev.yaml',
    'deploy/release.sh',
    'deployment/runbook.md',
    'scripts/deploy-prod.sh',
    'docs/DEPLOYMENT.md',
    'docs/DEVOPS.md',
  ]) {
    assert.equal(isDevOpsArtifact(filePath), true, filePath);
  }
});

test('isDevOpsArtifact ignores product docs and source files', () => {
  for (const filePath of [
    'README.md',
    'docs/PRODUCT-APPROVAL-PACKET.md',
    'client/src/app/events/page.tsx',
    'scripts/check-product-readiness.mjs',
    'scripts/check-devops-approval.mjs',
    'apps/api-gateway/src/main.ts',
  ]) {
    assert.equal(isDevOpsArtifact(filePath), false, filePath);
  }
});

test('findPrematureDevOpsArtifacts returns gated artifacts before approval', () => {
  const artifacts = findPrematureDevOpsArtifacts({
    root: process.cwd(),
    marker: '__missing-devops-approval__',
    files: [
      'README.md',
      '.github/workflows/ci.yml',
      'terraform/main.tf',
      'client/src/app/events/page.tsx',
    ],
  });

  assert.deepEqual(artifacts, ['.github/workflows/ci.yml', 'terraform/main.tf']);
});

test('findPrematureDevOpsArtifacts returns no artifacts after approval marker exists', () => {
  const artifacts = findPrematureDevOpsArtifacts({
    root: process.cwd(),
    marker: 'package.json',
    files: ['.github/workflows/ci.yml', 'terraform/main.tf'],
  });

  assert.deepEqual(artifacts, []);
});
