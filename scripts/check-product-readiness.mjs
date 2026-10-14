import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'README.md',
  'docs/PRODUCT-APPROVAL-PACKET.md',
  'docs/DEMO-SCRIPT.md',
  'docs/SHOWCASE-RUNBOOK.md',
  'docs/INTERVIEW-GUIDE.md',
  'docs/PRODUCT-APPROVAL-CHECKLIST.md',
  'docs/PRODUCT-STATUS.md',
  'scripts/check-devops-approval.mjs',
  'scripts/seed-showcase.mjs',
  'client/src/app/page.tsx',
  'client/src/app/events/page.tsx',
  'client/src/app/events/[eventId]/page.tsx',
  'client/src/app/tickets/page.tsx',
  'client/src/app/organizer/events/page.tsx',
  'client/src/app/organizer/check-in/page.tsx',
  'client/src/app/(auth)/login/page.tsx',
  'client/src/app/(auth)/register/page.tsx',
  'client/src/app/ops/page.tsx',
];

const forbiddenFiles = [
  {
    file: 'client/src/app/host/page.tsx',
    reason: 'Organizer routes should use /organizer, not the old /host alias',
  },
];

const ignoredDirectories = new Set([
  '.git',
  '.next',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);

const dockerArtifactPatterns = [
  /^\.dockerignore$/i,
  /^Dockerfile(?:\..*)?$/i,
  /^.*\.Dockerfile$/i,
  /^docker-compose\.(?:yaml|yml)$/i,
  /^compose\.(?:yaml|yml)$/i,
];

const devOpsApprovalMarker = '.planning/DEVOPS-APPROVED.md';

const uiForbiddenPatterns = [
  /Next\.js logo/i,
  /To get started/i,
  /edit the page\.tsx file/i,
  /Deploy Now/i,
  /Vercel logomark/i,
  /Local stack online/i,
  /UI Smoke Event/i,
  /\bdummy\b/i,
  /\bsample event\b/i,
  /\bdemo event\b/i,
];

const requiredUiEvidence = [
  {
    file: 'client/src/app/(auth)/layout.tsx',
    patterns: [/customer or organizer workspace/i, /Customers browse shows/i, /Organizers publish listings/i],
  },
  {
    file: 'client/src/app/(auth)/login/page.tsx',
    patterns: [/Welcome back/i, /Customer/i, /Organizer/i],
  },
  {
    file: 'client/src/app/(auth)/register/page.tsx',
    patterns: [/Join Evento/i, /separate workspace/i],
  },
  {
    file: 'client/src/features/evento/customer-marketplace.tsx',
    patterns: [/Book/i, /Events near you/i, /Search by event, venue, or city/i],
  },
  {
    file: 'client/src/features/evento/event-detail-checkout.tsx',
    patterns: [/quantity/i, /checkout/i, /ticket/i],
  },
  {
    file: 'client/src/features/evento/organizer-workspace.tsx',
    patterns: [/Create listing/i, /Listing preview/i, /Edit listing/i, /View bookings/i, /Customer bookings and entry codes/i],
  },
  {
    file: 'client/src/features/evento/ticket-wallet.tsx',
    patterns: [/Your tickets/i, /Booking confirmed/i, /Admission pass/i, /Entry code/i],
  },
  {
    file: 'client/src/features/evento/operations-view.tsx',
    patterns: [/Operations/i, /Services/i, /Kafka event stream/i],
  },
];

const errors = [];

function relativePath(filePath) {
  return path.relative(rootDir, filePath);
}

function readProjectFile(filePath) {
  return readFileSync(path.join(rootDir, filePath), 'utf8');
}

function walkProjectFiles(directory = '.') {
  const absoluteDirectory = path.join(rootDir, directory);
  const entries = readdirSync(absoluteDirectory);
  const files = [];

  for (const entry of entries) {
    const absoluteEntry = path.join(absoluteDirectory, entry);
    const stats = statSync(absoluteEntry);

    if (stats.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        files.push(...walkProjectFiles(relativePath(absoluteEntry)));
      }
      continue;
    }

    files.push(absoluteEntry);
  }

  return files;
}

function walkFiles(directory, extensions) {
  return walkProjectFiles(directory).filter((filePath) =>
    extensions.includes(path.extname(filePath)),
  );
}

for (const filePath of requiredFiles) {
  if (!existsSync(path.join(rootDir, filePath))) {
    errors.push(`Missing required product file: ${filePath}`);
  }
}

for (const forbidden of forbiddenFiles) {
  if (existsSync(path.join(rootDir, forbidden.file))) {
    errors.push(`Forbidden product file present: ${forbidden.file} (${forbidden.reason})`);
  }
}

if (!existsSync(path.join(rootDir, devOpsApprovalMarker))) {
  for (const filePath of walkProjectFiles()) {
    const fileName = path.basename(filePath);

    if (dockerArtifactPatterns.some((pattern) => pattern.test(fileName))) {
      errors.push(
        `Docker artifact should remain removed before approval: ${relativePath(filePath)}`,
      );
    }
  }
}

for (const filePath of walkFiles('client/src', ['.ts', '.tsx'])) {
  const source = readFileSync(filePath, 'utf8');

  for (const pattern of uiForbiddenPatterns) {
    if (pattern.test(source)) {
      errors.push(
        `Forbidden scaffold/incomplete-project UI phrase ${pattern} found in ${relativePath(filePath)}`,
      );
    }
  }
}

for (const evidence of requiredUiEvidence) {
  if (!existsSync(path.join(rootDir, evidence.file))) {
    errors.push(`Missing UI evidence file: ${evidence.file}`);
    continue;
  }

  const source = readProjectFile(evidence.file);

  for (const pattern of evidence.patterns) {
    if (!pattern.test(source)) {
      errors.push(`Missing expected product UI evidence ${pattern} in ${evidence.file}`);
    }
  }
}

const productStatus = readProjectFile('docs/PRODUCT-STATUS.md');
for (const requiredPhrase of [
  'Deferred Until Product Approval',
  'Do Not Claim Yet',
  'Kafka Story',
  'docs/PRODUCT-APPROVAL-PACKET.md',
  'docs/SHOWCASE-RUNBOOK.md',
]) {
  if (!productStatus.includes(requiredPhrase)) {
    errors.push(`PRODUCT-STATUS.md must include "${requiredPhrase}"`);
  }
}

if (errors.length > 0) {
  console.error('Product readiness check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Product readiness check passed.');
