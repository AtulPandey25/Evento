# Evento Showcase Runbook

Use this when you want to rehearse the project as a resume walkthrough without starting the gated DevOps phase.

For the final product approval decision, use `docs/PRODUCT-APPROVAL-PACKET.md`.

## Goal

Show Evento as a ticket-booking product first, then explain the microservices and Kafka architecture behind it.

The current product phase is intentionally no-Docker. Use the automated verification gate as the strongest proof that the customer, organizer, admin, and Kafka-contract flows are still intact.

## Before You Present

Run the full gate from the repository root:

```bash
pnpm verify
```

Expected result:

- Product readiness check passes.
- Pre-DevOps artifact guard passes.
- Backend Jest suites pass.
- Backend service e2e checks pass.
- Nest build passes.
- Client TypeScript, lint, and production build pass.
- Playwright role-flow tests pass.

Keep the final line handy. It proves the product routes and major role journeys are covered before you talk through the architecture.

## Local Runtime Notes

Docker is absent during this product-iteration phase.

For a live local runtime, provide these services outside the repo:

- PostgreSQL at `DATABASE_URL`, or the default `postgresql://eventoapp:evento_password@localhost:5432/eventoapp?schema=public`.
- Redis at `localhost:6379`, or set `REDIS_HOST` and `REDIS_PORT`.
- Kafka at `KAFKA_BROKER`, defaulting to `localhost:9093`, when running the Kafka-backed notification services.
- SMTP at `SMTP_HOST` / `SMTP_PORT` if you want to observe email delivery behavior.

Prepare schema when PostgreSQL is available:

```bash
pnpm exec drizzle-kit push
```

Load a repeatable product walkthrough dataset:

```bash
pnpm run seed:showcase
```

Showcase accounts:

| Role | Email | Password |
| --- | --- | --- |
| Organizer | `organizer@evento.local` | `Evento@123` |
| Customer | `customer@evento.local` | `Evento@123` |
| Admin | `admin@evento.local` | `Evento@123` |

The seed adds `Launch Night Live` as a published event and `EVT-SHOWCASE-26` as a confirmed customer ticket. It only resets those showcase identities and their linked event/ticket.

Start services in separate terminals:

```bash
pnpm exec nest start auth-service --watch
pnpm exec nest start events-service --watch
pnpm exec nest start tickets-service --watch
pnpm exec nest start notifications-service --watch
pnpm exec nest start api-gateway --watch
pnpm -C client run dev
```

Open:

```text
http://localhost:4000/events
```

Do not claim live Docker, Kubernetes, Terraform, GitHub Actions, or full Kafka/Postgres runtime verification until the final DevOps phase is approved and built.

## Five-Minute Walkthrough

1. Start at `/events`.
   Say: Evento is a role-based event-ticketing platform. Customers discover and book tickets; organizers manage listings and entry.

2. Show marketplace discovery.
   Point out poster cards, filters, city/date/category controls, price, seat availability, and booking actions.

3. Register or sign in as an organizer.
   Use `/register?role=organizer` when you want the organizer account type preselected.

4. Create and publish a listing.
   In `/organizer/events`, create a draft with real venue, city, category, capacity, and price. Edit the draft once, then publish it.

5. Register or sign in as a customer.
   Use `/events` to open the published listing, increase ticket quantity, and confirm the booking.

6. Open `/tickets`.
   Show the wallet, ticket quantity, total price, status, ticket code, QR-style pass, and cancellation confirmation.

7. Return to `/organizer/events`.
   Open `View bookings` and connect the booking manifest to the customer ticket wallet.

8. Open `/organizer/check-in`.
   Submit the ticket code and explain that the service verifies organizer ownership before check-in.

9. Explain Kafka.
   Keep it short: ticket purchase, event publishing, cancellation, and check-in emit domain events. Notifications and downstream ticket orchestration react in the background.

10. Close with verification and DevOps roadmap.
    Say: the product gate is no-Docker for now; the final approved phase adds CI/CD, Docker, Kubernetes, Terraform, and deployment documentation.

## Account Guidance

Use the seeded showcase accounts when you want the fastest, least risky walkthrough. Create fresh customer and organizer users during a longer walkthrough when you want registration itself to prove the role split.

The `/ops` route is admin-only. Use it only when your local database has an `ADMIN` account. Otherwise, explain the Kafka story from the tested backend contracts and the architecture docs.

## Strong Interview Phrases

- "The API Gateway owns public HTTP routing and JWT enforcement; domain services own business behavior."
- "Customers and organizers have separate surfaces so the app feels like a real ticketing platform, not a mixed admin dashboard."
- "Kafka is intentionally background infrastructure. The customer books a ticket; notification and cancellation workflows react asynchronously."
- "The no-Docker gate runs backend tests, service e2e checks, production builds, and Playwright role-flow tests before the DevOps layer is added."

## Stop Points

Pause and fix the product before DevOps if any of these happen:

- `/events` does not feel like the primary product entry.
- Organizer creation and customer booking feel mixed together.
- Ticket quantity, wallet code, or check-in flow is hard to explain.
- Kafka dominates the product story instead of supporting it.
- `pnpm verify` fails.
