# Product Approval Packet

Use this packet to decide whether the Evento product/demo surface is ready for the final DevOps phase.

## Decision Needed

Choose one:

- Approved: start the final DevOps phase.
- Needs polish: name the exact route or flow that still feels weak.
- Blocked: name the failing command or broken user flow.

Do not start GitHub Actions, Docker, Kubernetes, Terraform, or live runtime deployment work until the product surface is approved.

The repository enforces that rule with `scripts/check-devops-approval.mjs`. DevOps artifacts are blocked until `.planning/DEVOPS-APPROVED.md` exists after explicit product approval.

## Product Positioning

Evento is a resume-ready event-ticketing platform with separate customer, organizer, and admin surfaces.

- Customers browse events, choose ticket quantities, book passes, manage wallet tickets, and cancel eligible tickets.
- Organizers create listings, edit drafts, publish events, review booking manifests, cancel listings, and check in ticket codes.
- Admins use `/ops` only for service ownership and Kafka explanation.
- Kafka is background infrastructure for domain events and notification workflows, not a customer-facing feature.

## Current Review Routes

| Route | What to approve |
| --- | --- |
| `/events` | Customer marketplace, poster cards, search, category/city/date filters, sorting, seat urgency, booking actions |
| `/events/[eventId]` | Event detail, showtime, venue, quantity selector, sold-out behavior, checkout confirmation |
| `/tickets` | Customer wallet, ticket code, quantity, total price, QR-style pass, cancellation confirmation |
| `/organizer/events` | Organizer create/edit/publish/cancel, listing preview, booking manifest |
| `/organizer/check-in` | Organizer-only ticket-code validation |
| `/login` | Separate customer/organizer sign-in context |
| `/register` | Customer/organizer account selection |
| `/ops` | Admin-only service/Kafka overview |

## Showcase Data

When PostgreSQL is available, load repeatable rehearsal data:

```bash
pnpm run seed:showcase
```

Accounts:

| Role | Email | Password |
| --- | --- | --- |
| Organizer | `organizer@evento.local` | `Evento@123` |
| Customer | `customer@evento.local` | `Evento@123` |
| Admin | `admin@evento.local` | `Evento@123` |

Seeded product story:

- Published event: `Launch Night Live`
- Confirmed ticket code: `EVT-SHOWCASE-26`
- Seed behavior is scoped to deterministic showcase identities and does not reset unrelated local data.

## Verification Gate

Run:

```bash
pnpm verify
```

The current verified gate covers:

- Product readiness guard, including Docker artifact removal and scaffold/incomplete-project UI copy checks.
- Pre-DevOps approval guard for GitHub Actions, Docker, Terraform, Kubernetes, and Helm artifacts.
- Showcase seed tests and seed dry-run.
- Backend Jest service and contract tests.
- Backend service e2e health checks.
- Nest production build.
- Client TypeScript check, lint, and production build.
- Playwright role-flow tests, including a continuous demo smoke path from organizer publish to customer booking to organizer check-in.

## Approval Criteria

Approve the product surface only if:

- `/events` feels like the product entry for a ticket-booking platform.
- Customer booking and organizer management feel like separate workflows.
- Ticket quantity, wallet code, booking manifest, and check-in form connect clearly.
- Kafka is explainable as async backend infrastructure without dominating the customer/organizer UI.
- The 5-8 minute walkthrough in `docs/DEMO-SCRIPT.md` feels natural.
- `pnpm verify` passes.

## Do Not Claim Yet

Until the final DevOps phase is approved and implemented, do not claim:

- Docker Compose runtime is available.
- Live Kafka/Postgres e2e has been verified.
- GitHub Actions CI/CD is complete.
- Terraform infrastructure is complete.
- Kubernetes deployment is complete.
- Production-grade payment processing is implemented.

## Recommended Approval Flow

1. Run `pnpm verify`.
2. If using a live local database, run `pnpm exec drizzle-kit push` and `pnpm run seed:showcase`.
3. Open `/events` and walk through the route table above.
4. Read `docs/PRODUCT-APPROVAL-CHECKLIST.md` for pass/fail prompts.
5. Reply with one of:
   - "Approved for DevOps"
   - "Needs polish: <route or flow>"
   - "Blocked: <command or behavior>"

Only after "Approved for DevOps" should `.planning/DEVOPS-APPROVED.md` be created and DevOps artifacts reintroduced.
