# Product Status Snapshot

This is the current evidence snapshot for Evento before the final DevOps phase. Use it to decide whether the product surface is ready for your review, and use `PRODUCT-APPROVAL-CHECKLIST.md` before approving Docker, CI/CD, Terraform, and Kubernetes work.

## Current State

Evento is currently a ticket-booking product with separate customer, organizer, and admin surfaces:

- Customer marketplace, event detail checkout, multi-ticket booking, booking confirmation handoff, ticket wallet, cancellation, and ticket-code display are implemented.
- Ticket cancellation now requires confirmation so an accidental wallet click does not cancel a pass.
- Organizer sign-in links open organizer-context login copy without changing role-based auth behavior.
- Organizer signup links can open registration with the Organizer account type already selected.
- Organizer event creation with listing preview, draft editing, publishing, cancellation, attendee-aware booking manifest, and check-in flows are implemented.
- Organizer event cancellation now requires confirmation and warns that customer tickets will be cancelled.
- Wrong-role organizer routes now provide clear recovery actions back to the customer journey or organizer authentication.
- Admin operations view exists for service ownership and Kafka explanation, separated from customer and organizer screens.
- A no-Docker showcase seed script can load repeatable customer, organizer, admin, event, and ticket data for rehearsal.
- Kafka is represented as backend domain-event infrastructure, not as a customer-facing product feature.
- Docker has been removed from the active workflow while product changes continue.
- A pre-DevOps approval guard blocks GitHub Actions, Docker, Terraform, Kubernetes, and Helm artifacts until explicit approval.
- DevOps work remains gated until the product/demo surface is approved.

## Verified Evidence

The full no-Docker gate is:

```bash
pnpm verify
```

The product-only guardrail is:

```bash
pnpm run verify:product
```

The latest verified pass for this product surface covered:

- Product readiness checks for required routes, approval docs, pre-DevOps artifact gating, and starter/incomplete-project UI copy.
- Backend unit and integration-style Jest suites, including customer/organizer auth role contracts, API Gateway auth forwarding, organizer event ownership for publishing/cancellation, multi-ticket capacity contracts, invalid ticket quantity guards, and organizer manifest authorization.
- Backend service e2e health checks.
- NestJS production build.
- Client TypeScript check.
- Client lint.
- Next.js production build.
- Playwright role-flow coverage for marketplace entry routing, old-route removal, auth entry UX, customer, organizer, admin, subtle Kafka presentation, and mobile customer/organizer routes.

The important user flows covered by the current verification story are:

- Auth entry screens, customer/organizer registration, login role-based routing, and sign-out session clearing.
- Organizer-context login entry from organizer-only routes.
- Organizer signup preselection from organizer-specific entry points.
- Wrong-role organizer route recovery, including customer return actions and organizer authentication actions.
- Public entry routing to the ticket marketplace and rejection of the removed `/host` route.
- Customer marketplace, event-detail checkout, and booking confirmation handoff to the wallet.
- Multi-ticket booking and sold-out checkout behavior.
- Exact-capacity multi-ticket purchase succeeds while over-capacity purchase is rejected.
- Invalid ticket quantities are rejected before storage or Kafka side effects.
- Ticket wallet rendering, ticket codes, quantity, status, and cancellation rules.
- Ticket cancellation confirmation, including dismissing the in-app confirmation without sending a cancellation request.
- Organizer event creation with listing preview, draft editing, publishing, cancellation, booking manifests with attendee identity, and check-in.
- Organizer event cancellation confirmation, including dismissing the in-app confirmation without sending a cancellation request.
- Organizer publishing and cancellation are restricted to the owning organizer or admin role.
- Organizer manifests are restricted to the owning organizer or admin role.
- Admin-only operations access.
- Kafka and runtime wording stay out of customer and organizer product routes while remaining available in admin operations.
- Mobile customer marketplace/checkout and organizer workspace/manifest layout checks.
- Kafka event payloads and notification behavior at service/contract level.

## Routes To Review

Use these routes for product approval:

| Route | Review purpose |
| --- | --- |
| `/events` | Customer marketplace |
| `/events/[eventId]` | Customer event detail and checkout |
| `/tickets` | Customer ticket wallet |
| `/organizer/events` | Organizer event management |
| `/organizer/check-in` | Organizer ticket validation |
| `/login` | Sign in |
| `/register` | Customer and organizer signup |
| `/ops` | Admin-only service and Kafka overview |

## Demo Story

Show the product first:

1. Start at `/events`.
2. Show event discovery, filters, poster cards, seat availability, and booking actions.
3. Register or sign in as an organizer.
4. Create, edit, and publish an event from `/organizer/events`.
5. Register or sign in as a customer.
6. Open an event detail page and book multiple tickets.
7. Open `/tickets` and show the wallet, quantity, ticket code, and status.
8. Return to the organizer workspace and open the booking manifest.
9. Use `/organizer/check-in` with the ticket code.
10. Explain Kafka only after the product flow is clear.

## Kafka Story

Kafka supports background domain workflows:

- `auth-service` emits registration/login events.
- `events-service` emits event lifecycle events.
- `tickets-service` emits purchase, cancellation, and check-in events.
- `tickets-service` also reacts to event-cancellation events by cancelling confirmed attendee tickets.
- `notifications-service` consumes those events and builds email-style notification workflows.

Good interview framing:

> Kafka lets the product stay focused on booking while notifications and downstream ticket orchestration react asynchronously to domain events.

## Approval Gate

Before starting DevOps, use:

- `docs/PRODUCT-APPROVAL-PACKET.md`
- `docs/PRODUCT-APPROVAL-CHECKLIST.md`
- `docs/SHOWCASE-RUNBOOK.md`
- `docs/DEMO-SCRIPT.md`
- `docs/INTERVIEW-GUIDE.md`

Approve the product surface only when:

- The customer UI feels like a ticket-booking product.
- The organizer UI feels separate from customer booking.
- The walkthrough is clear enough for a 5-8 minute demo.
- `pnpm verify` passes.

If you reject the product surface, name the exact route or flow that still feels weak so the next pass can focus there.

## Deferred Until Product Approval

These are intentionally not complete yet:

- Live Docker Compose runtime.
- Live Kafka/Postgres runtime verification.
- GitHub Actions CI/CD.
- Terraform infrastructure.
- Kubernetes manifests or Helm chart.
- Production payment processing.

## Do Not Claim Yet

Do not claim:

- Docker is available in the current workflow.
- Live Kafka/Postgres e2e has been verified.
- Kubernetes, Terraform, or GitHub Actions are complete.
- Event cancellation reverses tickets already checked in.
- Production-grade payment processing is implemented.
