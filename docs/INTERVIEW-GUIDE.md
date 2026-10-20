# Evento Interview Guide

Use this when you need to explain the project clearly in an interview or resume walkthrough.

For the current product evidence snapshot, review [PRODUCT-STATUS.md](PRODUCT-STATUS.md).
Before starting the final DevOps phase, use [PRODUCT-APPROVAL-CHECKLIST.md](PRODUCT-APPROVAL-CHECKLIST.md) to approve the product/demo surface.

## One-Minute Explanation

Evento is an event-ticketing platform built with NestJS microservices and a Next.js frontend. Customers browse and book event tickets, organizers create and manage event listings, and backend services communicate through an API gateway plus Kafka domain events.

The project is intentionally not a huge production clone. It is a resume-ready system that demonstrates product thinking, role-based UI design, microservice boundaries, Kafka event flows, and strong no-Docker verification gates before the final DevOps layer is added.

## What Problem It Solves

A real ticketing product has different user journeys:

- Customers need discovery, checkout, ticket wallet, cancellation, and entry codes.
- Organizers need event creation, draft editing, publishing, booking visibility, cancellation, and check-in.
- Admins need a quiet system overview that explains services and Kafka without cluttering the customer experience.

Evento separates these responsibilities instead of putting everything into one mixed dashboard.

## Architecture In Plain English

The browser talks to the API Gateway. The API Gateway validates JWT identity and forwards requests to smaller services.

- `auth-service` owns registration, login, JWTs, and roles.
- `events-service` owns event drafts, edits, publishing, cancellation, city/category, and inventory summaries.
- `tickets-service` owns ticket purchase, quantities, wallet tickets, cancellation, check-in, and event-cancellation ticket orchestration.
- `notifications-service` consumes Kafka events and sends email-style notification workflows.
- `client` is the Next.js UI for customer, organizer, and admin operations routes.
- `libs/common`, `libs/database`, and `libs/kafka` hold shared contracts, schema, and event constants.

## Main User Flows

### Customer

1. Register or sign in as a customer.
2. Browse `/events`.
3. Use search, category, city, date, and sort controls.
4. Open an event through `Book now`.
5. Review poster, showtime, venue, seat urgency, ticket type, and total.
6. Increase quantity and confirm booking.
7. Open `/tickets` to see the booking confirmation, ticket wallet, QR-style pass, ticket code, quantity, price, and cancellation status.

### Organizer

1. Register or sign in as an organizer.
2. Open `/organizer/events`.
3. Create an event draft with title, description, venue, city, category, capacity, price, and the live listing preview.
4. Edit the draft before publishing.
5. Publish the event so customers can book it.
6. View the booking manifest, including attendee name, email, ticket code, quantity, and booking value.
7. Use `/organizer/check-in` to validate a ticket code at entry.

### Admin

1. Sign in as an admin.
2. Open `/ops`.
3. Explain service ownership and Kafka event contracts.

## Kafka Story

Kafka is not shown as a customer-facing feature. It is the asynchronous backend layer.

Important events:

- `user.registered`
- `event.created`
- `event.published`
- `event.updated`
- `event.cancelled`
- `ticket.purchased`
- `ticket.cancelled`
- `ticket.checked-in`

Good interview phrasing:

> Kafka lets the booking flow stay product-focused while notifications and downstream ticket orchestration react asynchronously to domain events.

Examples:

- When a customer buys tickets, `tickets-service` emits `ticket.purchased`; `notifications-service` consumes it for the ticket email.
- When an organizer cancels an event, `events-service` emits `event.cancelled`; `tickets-service` consumes it to auto-cancel confirmed attendee tickets, then emits customer-facing cancellation events.
- When an organizer checks in a ticket, `tickets-service` emits `ticket.checked-in`; `notifications-service` consumes it for check-in confirmation.

## Testing Story

Use this command first:

```bash
pnpm verify
```

It runs:

- Backend Jest service and contract tests.
- Product readiness and pre-DevOps artifact guard.
- Customer/organizer auth role contract tests.
- API Gateway auth forwarding tests.
- Organizer event ownership tests for publishing and cancellation.
- Multi-ticket capacity contract tests.
- Invalid ticket quantity guard tests.
- Organizer manifest authorization tests.
- Backend service e2e health checks.
- Nest build.
- Client TypeScript check.
- Client lint.
- Next.js production build.
- Playwright role-flow tests.
- Marketplace entry route and old-route removal checks.
- Subtle Kafka presentation checks.
- Auth entry UX checks.
- Organizer-context login checks.
- Organizer signup preselection checks.
- Wrong-role journey recovery checks for customer and organizer surfaces.
- Mobile customer and organizer layout checks.

If you want to show the gates separately:

```bash
pnpm run verify:backend
pnpm run verify:client
```

What the tests prove:

- Auth entry screens plus customer/organizer registration, login, and sign-out session behavior.
- Organizer-specific sign-in entry points show organizer copy while post-login routing still follows the returned account role.
- Organizer-specific signup entry points preselect the Organizer account type before submission.
- Wrong-role users are guided back to the correct customer or organizer journey instead of seeing a dead-end access panel.
- Public entry routing to the ticket marketplace and removal of the old `/host` organizer alias.
- Customer booking with ticket quantity, auth header, exact-capacity handling, invalid-quantity rejection, and wallet confirmation handoff.
- Sold-out checkout behavior.
- Ticket wallet QR/code rendering and cancellation rules.
- Ticket cancellation confirmation so an accidental click does not cancel a pass.
- Organizer event creation with live listing preview, draft editing, publishing, cancellation, attendee-aware booking manifest, and check-in.
- Organizer event cancellation confirmation so a published listing is not cancelled accidentally.
- Organizer publish/cancel actions are protected so a different organizer cannot manage someone else's listing.
- Organizer manifests are protected so customer accounts and other organizers cannot inspect someone else's event bookings.
- Admin-only operations surface.
- Kafka/runtime details stay out of customer and organizer product routes but remain visible in admin operations.
- Mobile customer marketplace/checkout and organizer workspace/manifest layout checks.
- No-Docker HTTP contracts for critical gateway-to-service event update wiring.
- Kafka event payloads and notification behavior at service/contract level.

## What To Show In A 5-8 Minute Walkthrough

1. Start at `/events` and show the product first.
2. Show poster cards, featured event, filters, seat urgency, and `Book now`.
3. Register as organizer and create/edit/publish an event.
4. Register or sign in as customer and book multiple tickets.
5. Open `/tickets` and show the wallet, QR-style pass, quantity, and code.
6. Return to organizer and show `View bookings`.
7. Use `/organizer/check-in` with the ticket code.
8. Briefly open `/ops` as admin to explain service boundaries and Kafka contracts.
9. Close with `pnpm verify` and the DevOps roadmap.

## What Not To Claim Yet

- Do not claim live Kafka/Postgres e2e is verified while Docker is intentionally removed.
- Do not claim production payments are implemented.
- Do not claim checked-in tickets are reversed when an event is cancelled.
- Do not claim Docker, Kubernetes, Terraform, or GitHub Actions are complete yet.

## Resume Bullet Ideas

- Built Evento, a NestJS microservices event-ticketing platform with separate customer, organizer, and admin workspaces.
- Implemented ticket booking, multi-ticket checkout, organizer publishing, booking manifests, wallet passes, cancellation, and check-in flows.
- Designed Kafka-backed domain events for registration, event lifecycle, ticket purchase, cancellation, and check-in notification workflows.
- Added no-Docker verification gates covering backend service tests, HTTP contracts, service e2e checks, production builds, and Playwright role-flow tests.
