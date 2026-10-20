# Product Approval Checklist

Use this checklist before starting the final DevOps phase. The goal is to confirm the product experience is strong enough for a resume demo before adding GitHub Actions, Docker, Kubernetes, Terraform, and deployment material.

## Approval Rule

Start the DevOps phase only after these are true:

- The customer flow feels like a real ticket-booking product.
- The organizer flow feels separate from the customer flow.
- Kafka is explainable as backend infrastructure without dominating the UI.
- `pnpm verify` passes.
- The pre-DevOps approval guard passes without a DevOps approval marker.
- You are comfortable using the demo script in a 5-8 minute walkthrough.

## 1. No-Docker Verification

Run:

```bash
pnpm verify
```

Expected result:

- Product readiness checks pass, including the repo-wide Docker artifact guard.
- Pre-DevOps approval guard passes while Docker, CI/CD, Terraform, Kubernetes, and Helm artifacts remain gated.
- Backend Jest passes.
- Backend service e2e health checks pass.
- Nest build passes.
- Client TypeScript check passes.
- Client lint passes.
- Next.js production build passes.
- Playwright role-flow tests pass.
- Mobile customer and organizer layout checks pass.

Optional local rehearsal data:

```bash
pnpm run seed:showcase
```

Approve if the command loads the documented showcase accounts and published event when PostgreSQL is available.

Fallback split commands:

```bash
pnpm run verify:backend
pnpm run verify:client
```

## 2. Customer Marketplace

Route: `/events`

Approve if:

- The page opens directly into the ticket discovery experience.
- The featured event and event cards use photographic poster treatment.
- The UI has `Book now` / featured booking actions instead of generic starter-project copy.
- Search, category, city, date, and sort controls are easy to understand.
- Seat availability and urgency are visible.
- The page does not expose organizer/admin/Kafka details to customers.

Reject if:

- It feels like a generic dashboard instead of a ticket marketplace.
- Events, filters, or booking buttons feel confusing during a live walkthrough.

## 3. Customer Checkout

Route: `/events/[eventId]`

Approve if:

- Event poster, category, showtime, venue, and seat availability are clear.
- Checkout shows the event being booked, ticket type, included fee, and total.
- Quantity can be increased before confirming.
- Sold-out events disable checkout.
- Organizer accounts cannot purchase customer tickets.

Reject if:

- The checkout feels unfinished instead of like a real booking step.
- Ticket quantity or sold-out behavior is unclear.

## 4. Ticket Wallet

Route: `/tickets`

Approve if:

- Signed-out users are asked to sign in.
- Confirmed tickets show event title, date, venue, quantity, total price, ticket code, and QR-style pass.
- Confirmed tickets can be cancelled after an in-app confirmation.
- Checked-in or cancelled tickets cannot be cancelled again.

Reject if:

- The wallet does not clearly feel customer-owned.
- Ticket codes are hard to find for check-in.

## 5. Organizer Event Management

Route: `/organizer/events`

Approve if:

- Customer accounts see organizer access blocked.
- Organizers can create a draft event with venue, city, category, capacity, and price.
- Organizers can edit draft listings before publishing.
- Organizers can publish listings for customer booking.
- Organizers can cancel listings after an in-app confirmation that warns customer tickets will be cancelled.
- Organizers can open `View bookings` to inspect booking manifest details.
- Published/cancelled listings do not mix confusingly with draft editing.

Reject if:

- Organizer creation and customer booking feel like one mixed UI.
- Draft edit, publish, cancel, or booking visibility are hard to demo.

## 6. Organizer Check-In

Route: `/organizer/check-in`

Approve if:

- Customer accounts cannot access organizer check-in tools.
- Organizers can submit a ticket code.
- The ticket code matches the wallet and booking manifest story.
- You can explain that ownership is checked by the service.

Reject if:

- It is unclear where the ticket code comes from.
- Check-in appears to be a customer feature.

## 7. Admin Operations And Kafka Story

Route: `/ops`

Approve if:

- `/ops` is admin-only.
- The page supports the microservices/Kafka explanation without becoming the product homepage.
- Kafka is described as async infrastructure for domain events.
- You can explain `event.published`, `event.updated`, `event.cancelled`, `ticket.purchased`, `ticket.cancelled`, and `ticket.checked-in`.

Reject if:

- Kafka feels like the main product instead of infrastructure.
- Customer/organizer accounts can access admin operations details.

## 8. Interview Explanation

Read:

- `docs/PRODUCT-APPROVAL-PACKET.md`
- `docs/DEMO-SCRIPT.md`
- `docs/SHOWCASE-RUNBOOK.md`
- `docs/INTERVIEW-GUIDE.md`

Approve if you can explain:

- What Evento is in one minute.
- Why customer and organizer UIs are separate.
- What each microservice owns.
- What Kafka does in the background.
- What the tests prove.
- What the final DevOps phase will add.

## 9. Do Not Claim Yet

Do not claim these until the final DevOps/runtime phase is complete:

- Live Kafka/Postgres e2e is verified.
- Docker Compose is available.
- Kubernetes deployment is complete.
- Terraform infrastructure is complete.
- GitHub Actions CI/CD is complete.
- Production payment processing is implemented.

## Product Approval Decision

Use this decision before starting DevOps:

- Approved: product/demo surface is ready; start the final DevOps phase.
- Needs polish: list the exact route or flow that still feels weak.
- Blocked: identify the failing verification command or broken user flow.
