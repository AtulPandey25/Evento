# Evento Demo Script

This script is designed for a 5-8 minute walkthrough. The goal is to show a polished ticketing product first, then reveal the microservices and Kafka architecture behind it.

For deeper interview answers, architecture explanation, and resume bullets, use [INTERVIEW-GUIDE.md](INTERVIEW-GUIDE.md).

## 1. Open With The Product

Route: `/events`

Before the walkthrough, seed a repeatable local dataset when PostgreSQL is available:

```bash
pnpm run seed:showcase
```

Say:

> Evento is an event-ticketing platform with separate customer and organizer workspaces. Customers book tickets, organizers publish listings and check people in, and backend services communicate through an API gateway and Kafka events.

Show:

- Featured event with photographic poster treatment.
- Marketplace cards.
- `Book now` actions and low-seat urgency labels.
- Search, organizer-selected category, city, date, and sort controls.
- Event dates, venues, realistic INR prices, and detail entry points.
- Remaining seat counts on event cards without exposing internal sales metrics as the main customer signal.

Avoid starting with `/ops`; it makes the project feel like infrastructure before product.

## 2. Organizer Flow

Route: `/register`

Show:

- Select `Organizer`.
- Create an organizer account.
- Navigate to `/organizer/events`.

Route: `/organizer/events`

Show:

- Create a draft event.
- Fill in venue, city, category, capacity, and price as real listing data.
- Edit the draft once to show organizer updates before sales open.
- Publish the event.
- Explain that customers only see published events.
- After a customer books, return here and open `View bookings` to show the booking manifest.
- Optionally cancel a listing to show the organizer can close sales.

Say:

> The organizer workspace is separated from the customer marketplace. This keeps the UI closer to a real ticketing product instead of one mixed admin screen.

> The booking manifest gives organizers a sales-and-entry view for each listing without exposing customer tools in the organizer workspace.

Backend evidence:

- `POST /auth/register`
- `POST /events`
- `POST /events/:id/publish`
- `POST /events/:id/cancel`

Kafka evidence:

> Publishing moves the event into the marketplace and emits `event.published`, which the notifications service consumes for an organizer confirmation email.

> Cancelling a listing emits `event.cancelled`. The notifications service consumes it for the organizer email, and the tickets service consumes it to auto-cancel confirmed attendee tickets.

## 3. Customer Booking Flow

Route: `/register` or `/login`

Show:

- Customer account.
- `/events` marketplace.
- Open an event detail page.
- Point out the poster, compact show summary, mobile entry pass notes, and seat urgency.
- Increase ticket quantity in checkout.
- Show the checkout recap with event title, venue/date, ticket type, included fee, and wallet confirmation note.
- Confirm booking.

Say:

> Ticket purchase validates role, published event status, and remaining capacity in the tickets service. Checked-in tickets still consume capacity, cancelled tickets free capacity, and the order stores quantity and total price, not just a single-ticket flag.

## 4. Ticket Wallet

Route: `/tickets`

Show:

- Ticket code.
- Quantity.
- Total price.
- Status.
- QR-style pass.
- Cancel button and confirmation prompt for confirmed tickets.

Say:

> The wallet is the customer-owned ticket surface. Confirmed tickets can be cancelled after an in-app confirmation, but checked-in tickets are protected from cancellation.

## 5. Organizer Check-In

Route: `/organizer/check-in`

Show:

- Paste or type a ticket code.
- Submit check-in.
- Mention that the same code is visible in the organizer booking manifest and the customer wallet.

Say:

> Check-in is organizer-only. The service verifies the organizer owns the event before marking a ticket checked in.

Backend evidence:

- `POST /tickets/check-in`
- Emits `ticket.checked-in`

## 6. Kafka Story

Route: `/ops` only if using an admin account.

Say:

> Kafka is used as the async notification layer. The UI does not push Kafka in the customer's face, but the backend emits domain events such as `event.published`, `ticket.purchased`, `ticket.checked-in`, `ticket.cancelled`, and `event.cancelled`.

Mention:

- `auth-service` emits `user.registered`.
- `tickets-service` emits `ticket.purchased`, `ticket.cancelled`, and `ticket.checked-in`.
- Ticket notification emails use INR totals and include event date/venue details from Kafka payloads.
- `tickets-service` also consumes `event.cancelled` and emits customer-facing `ticket.cancelled` events for confirmed tickets affected by the event cancellation.
- `events-service` emits `event.created`, `event.published`, `event.updated`, and `event.cancelled`.
- `notifications-service` consumes registration, event publish, ticket purchase, ticket check-in, ticket cancellation, and event cancellation events.

Be honest:

> Event cancellation auto-cancels confirmed attendee tickets. Tickets already marked checked in are not retroactively undone.

## 7. Testing Story

Say:

> Since Docker is removed during product iteration, the project has no-Docker verification gates: unit and integration-style Jest tests for services, service health e2e checks, and Playwright browser tests for the main role flows.

Show commands:

```bash
pnpm verify
pnpm run verify:backend
pnpm run verify:client
```

## 8. Close With DevOps Roadmap

Say:

> Once the product surface is approved, the final resume layer is DevOps: GitHub Actions, Docker, Kubernetes, Terraform, and deployment documentation. I intentionally removed that layer for now so the app first feels like a real ticketing product.

Do not claim:

- A Docker stack is available right now; Docker has been removed from the active workflow.
- Event cancellation reverses tickets already marked checked in.
- Real payment processing is complete.
- Customer-facing publish notifications are implemented; publishing currently sends organizer confirmation only.
- `/ops` is available to customer or organizer accounts; it is admin-only.
