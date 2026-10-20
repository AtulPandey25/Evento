# Evento UI Direction

Evento should feel like a ticket-booking product first and a microservices showcase second. The primary screens are split by role so a reviewer can understand the product without reading the backend code.

## Roles

- Customer: browse events, filter/search listings, choose ticket quantity, purchase tickets, view ticket wallet, cancel eligible tickets.
- Organizer: create listings, publish events, monitor event status, validate ticket codes at check-in.
- Admin/system: inspect gateway, Kafka event contracts, notification flow, and service/data topology without mixing those controls into the customer booking flow.

## Navigation

- `/events`: customer marketplace.
- `/tickets`: customer ticket wallet.
- `/organizer/events`: organizer event management.
- `/organizer/check-in`: organizer entry validation.
- `/ops`: system view for technical walkthroughs.

## Product Feel

- Ticketing UI should be dense enough for repeated use but still visually polished.
- Customer screens should emphasize event cards, dates, venues, prices, and booking quantity.
- Organizer screens should emphasize forms, event state, publish actions, capacity, and check-in feedback.
- Kafka and infrastructure should appear as supporting evidence, not as the first thing a customer sees.

## Quality Bar

- No generated scaffold copy in user-facing screens or docs.
- No fake placeholder events that imply the application is incomplete.
- Forms must show clear validation and actionable errors.
- E2E tests should cover customer, organizer, auth, booking, wallet, and check-in paths.
