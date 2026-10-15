import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const approvalMarker = '.planning/DEVOPS-APPROVED.md';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ignoredDirectories = new Set([
  '.git',
  '.next',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);

const gatedPathPatterns = [
  /^\.github\/workflows\//i,
  /^\.gitlab-ci\.ya?ml$/i,
  /^Jenkinsfile$/i,
  /^\.circleci\//i,
  /^\.buildkite\//i,
  /^azure-pipelines\.ya?ml$/i,
  /^bitbucket-pipelines\.ya?ml$/i,
  /^docker\//i,
  /(^|\/)docker\//i,
  /^terraform\//i,
  /^infra\//i,
  /^infrastructure\//i,
  /^infra\/terraform\//i,
  /^k8s\//i,
  /^kubernetes\//i,
  /^helm\//i,
  /^charts\//i,
  /^deploy\//i,
  /^deployment\//i,
  /^scripts\/deploy[^/]*$/i,
  /^docs\/(?:DEPLOY|DEVOPS|CI|TERRAFORM|KUBERNETES)/i,
  /(^|\/)Dockerfile(?:\..*)?$/i,
  /(^|\/).*\.Dockerfile$/i,
  /(^|\/)\.dockerignore$/i,
  /(^|\/)docker-compose.*\.(?:yaml|yml)$/i,
  /(^|\/)compose.*\.(?:yaml|yml)$/i,
  /\.tf$/i,
  /\.tfvars$/i,
  /(^|\/)\.terraform\.lock\.hcl$/i,
  /(^|\/)Chart\.yaml$/i,
  /(^|\/)values.*\.ya?ml$/i,
  /(^|\/)kustomization\.ya?ml$/i,
  /(^|\/)skaffold\.ya?ml$/i,
];

export function isDevOpsArtifact(relativePath) {
  return gatedPathPatterns.some((pattern) => pattern.test(relativePath));
}

function walkProjectFiles(directory = '.', root = rootDir) {
  const absoluteDirectory = path.join(root, directory);
  const entries = readdirSync(absoluteDirectory);
  const files = [];

  for (const entry of entries) {
    const absoluteEntry = path.join(absoluteDirectory, entry);
    const relativeEntry = path.relative(root, absoluteEntry);
    const stats = statSync(absoluteEntry);

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walkProjectFiles(relativeEntry, root));
      }
      continue;
    }

    files.push(relativeEntry);
  }

  return files;
}

export function findPrematureDevOpsArtifacts({
  root = rootDir,
  marker = approvalMarker,
  files = walkProjectFiles('.', root),
} = {}) {
  if (existsSync(path.join(root, marker))) {
    return [];
  }

  return files.filter(isDevOpsArtifact).sort((left, right) => left.localeCompare(right));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const artifacts = findPrematureDevOpsArtifacts();

  if (artifacts.length > 0) {
    console.error('DevOps approval gate failed.');
    console.error(
      `Create ${approvalMarker} only after explicit product approval, then reintroduce DevOps artifacts.`,
    );
    for (const artifact of artifacts) {
      console.error(`- ${artifact}`);
    }
    process.exit(1);
  }

  console.log('DevOps approval gate passed.');
}
