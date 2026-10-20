# Evento Frontend

Evento's frontend is a Next.js ticket-booking experience for two roles:

- Customers browse published events, choose ticket quantities, purchase tickets, and manage their ticket wallet.
- Organizers create event listings, publish events, and validate ticket codes at check-in.

The browser talks to the NestJS API Gateway at `http://localhost:3000`. The gateway then routes requests to the auth, events, and tickets services. Kafka-powered notification contracts are verified through backend service tests while the UI keeps that infrastructure in the background.

## Local Development

```bash
pnpm install
pnpm dev
```

The app runs on [http://localhost:4000](http://localhost:4000).

For a live local product run, start the NestJS services from the repository root and make sure PostgreSQL, Redis, and Kafka are available outside the repo. Docker is intentionally absent until the final approved DevOps phase.

To load the repeatable product walkthrough dataset, run this from the repository root after the schema is ready:

```bash
pnpm run seed:showcase
```

For the full architecture and interview walkthrough, see the root [README](../README.md), [showcase runbook](../docs/SHOWCASE-RUNBOOK.md), and [demo script](../docs/DEMO-SCRIPT.md).

## Quality Gates

Run the complete product gate from the repository root:

```bash
pnpm verify
```

This includes product readiness, pre-DevOps artifact gating, backend tests, frontend checks, and Playwright role-flow coverage.

Frontend-only checks:

```bash
pnpm lint
pnpm build
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3999 pnpm test:e2e
```
