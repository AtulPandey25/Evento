import { expect, test, type Page } from '@playwright/test';

const apiBase = 'http://127.0.0.1:3999';

const event = {
  id: '7dd79962-8f8b-4c3f-92ac-8e2ce74195b0',
  title: 'Launch Night',
  description: 'A curated evening of talks and music.',
  date: '2026-07-20T18:30:00.000Z',
  location: 'Mumbai Arena',
  city: 'Mumbai',
  category: 'Live shows',
  capacity: 200,
  soldTickets: 35,
  remainingCapacity: 165,
  price: 150000,
  status: 'PUBLISHED',
  organizerId: 'organizer-1',
  createdAt: '2026-06-30T10:00:00.000Z',
  updatedAt: '2026-06-30T10:00:00.000Z',
};

const draftEvent = {
  ...event,
  id: '8aa79962-8f8b-4c3f-92ac-8e2ce74195b1',
  title: 'Draft Circle',
  price: 255000,
  status: 'DRAFT',
};

const workshopEvent = {
  ...event,
  id: '9bb79962-8f8b-4c3f-92ac-8e2ce74195b2',
  title: 'Design Workshop',
  description: 'Hands-on workshop for product teams.',
  date: '2026-08-05T10:00:00.000Z',
  location: 'Srishti Auditorium',
  city: 'Bengaluru',
  category: 'Workshops',
  capacity: 80,
  soldTickets: 70,
  remainingCapacity: 10,
  price: 250000,
};

const soldOutEvent = {
  ...event,
  id: '1cc79962-8f8b-4c3f-92ac-8e2ce74195b3',
  title: 'Sold Out Summit',
  description: 'A packed leadership summit.',
  location: 'Delhi Expo Center',
  city: 'Delhi',
  category: 'Startup meetups',
  capacity: 80,
  soldTickets: 80,
  remainingCapacity: 0,
  price: 350000,
};

type MockTicketStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN';

type MockTicket = {
  id: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  totalPrice: number;
  status: MockTicketStatus;
  purchasedAt: string;
  checkedInAt: string | null;
  userName?: string;
  userEmail?: string;
};

const walletTicket: MockTicket = {
  id: 'ticket-1',
  ticketCode: 'EVT-9K2M-ABC123',
  eventId: event.id,
  eventTitle: 'Launch Night',
  eventDate: event.date,
  eventLocation: event.location,
  quantity: 3,
  totalPrice: 450000,
  status: 'CONFIRMED' as const,
  purchasedAt: '2026-06-30T10:00:00.000Z',
  checkedInAt: null,
  userName: 'Customer One',
  userEmail: 'customer@example.com',
};

type MockEvent = typeof event;

async function mockApiEnvelope(
  page: Page,
  options: {
    publishedEvents?: MockEvent[];
    myEvents?: MockEvent[];
    tickets?: MockTicket[];
    eventTickets?: MockTicket[];
    onEventTicketsRequest?: (authHeader: string | null) => void;
    createEvent?: (
      body: Record<string, unknown>,
      authHeader: string | null,
    ) => MockEvent;
    updateEvent?: (
      body: Record<string, unknown>,
      authHeader: string | null,
    ) => MockEvent;
  } = {},
) {
  await page.route(`${apiBase}/`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({ json: { data: 'Evento API Gateway' } });
  });
  await page.route(`${apiBase}/events`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: { data: options.publishedEvents ?? [event] } });
      return;
    }

    if (route.request().method() === 'POST' && options.createEvent) {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const authHeader = route.request().headers().authorization ?? null;
      await route.fulfill({
        json: { data: options.createEvent(body, authHeader) },
      });
      return;
    }

    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }
  });
  await page.route(`${apiBase}/events/${event.id}`, async (route) => {
    await route.fulfill({ json: { data: event } });
  });
  await page.route(`${apiBase}/events/${workshopEvent.id}`, async (route) => {
    await route.fulfill({ json: { data: workshopEvent } });
  });
  await page.route(`${apiBase}/events/${soldOutEvent.id}`, async (route) => {
    await route.fulfill({ json: { data: soldOutEvent } });
  });
  await page.route(`${apiBase}/events/${draftEvent.id}`, async (route) => {
    if (route.request().method() === 'PUT' && options.updateEvent) {
      const body = route.request().postDataJSON() as Record<string, unknown>;
      const authHeader = route.request().headers().authorization ?? null;

      await route.fulfill({
        json: { data: options.updateEvent(body, authHeader) },
      });
      return;
    }

    await route.fulfill({ json: { data: draftEvent } });
  });
  await page.route(`${apiBase}/events/my-events`, async (route) => {
    await route.fulfill({ json: { data: options.myEvents ?? [event] } });
  });
  await page.route(`${apiBase}/tickets/my-tickets`, async (route) => {
    await route.fulfill({ json: { data: options.tickets ?? [] } });
  });
  await page.route(`${apiBase}/tickets/event/${event.id}`, async (route) => {
    options.onEventTicketsRequest?.(route.request().headers().authorization ?? null);
    await route.fulfill({ json: { data: options.eventTickets ?? [walletTicket] } });
  });
  await page.route(`${apiBase}/tickets/event/${draftEvent.id}`, async (route) => {
    options.onEventTicketsRequest?.(route.request().headers().authorization ?? null);
    await route.fulfill({ json: { data: options.eventTickets ?? [] } });
  });
}

async function seedAuth(
  page: Page,
  role: 'USER' | 'ORGANIZER' | 'ADMIN',
  path: string,
) {
  await page.addInitScript(
    ({ selectedRole }) => {
      const user = {
        id: `${selectedRole.toLowerCase()}-1`,
        email:
          selectedRole === 'ADMIN'
            ? 'admin@example.com'
            : selectedRole === 'ORGANIZER'
              ? 'organizer@example.com'
              : 'customer@example.com',
        name:
          selectedRole === 'ADMIN'
            ? 'Admin'
            : selectedRole === 'ORGANIZER'
              ? 'Organizer'
              : 'Customer',
        role: selectedRole,
      };

      window.localStorage.setItem('accessToken', `token-${selectedRole}`);
      window.localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state: {
            user,
            accessToken: `token-${selectedRole}`,
            isAuthenticated: true,
          },
          version: 0,
        }),
      );
    },
    { selectedRole: role },
  );

  await page.goto(path);
}

async function expectNoPageHorizontalOverflow(page: Page) {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const root = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(root.scrollWidth, body.scrollWidth);

        return scrollWidth - window.innerWidth;
      }),
    )
    .toBeLessThanOrEqual(1);
}

test('public entry route opens the ticket marketplace', async ({ page }) => {
  await mockApiEnvelope(page);

  await page.goto('/');

  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { name: 'Events near you' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Book now/ }).first()).toBeVisible();
  await expect(page.getByText(/INR\s*1,500\.00/)).toBeVisible();
});

test('old host route is not exposed as an organizer workspace', async ({ page }) => {
  const response = await page.goto('/host');

  expect(response?.status()).toBe(404);
  await expect(page).not.toHaveURL(/\/organizer\/events$/);
  await expect(page.getByRole('heading', { name: 'Create listing' })).toHaveCount(0);
});

test('registration submits selected Organizer role', async ({ page }) => {
  let registerBody: Record<string, unknown> | undefined;

  await page.route(`${apiBase}/auth/register`, async (route) => {
    registerBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      json: {
        data: {
          message: 'User registered successfully',
          user: {
            id: 'organizer-1',
            email: registerBody.email,
            name: registerBody.name,
            role: registerBody.role,
            createdAt: '2026-06-30T10:00:00.000Z',
            updatedAt: '2026-06-30T10:00:00.000Z',
          },
        },
      },
    });
  });

  await page.goto('/register');
  await expect(
    page.getByRole('heading', { name: 'Choose a customer or organizer workspace.' }),
  ).toBeVisible();
  await expect(
    page.getByText('Select Customer to book tickets or Organizer to manage event listings.'),
  ).toBeVisible();
  await page.getByLabel('Name').fill('Organizer One');
  await page.getByLabel('Email').fill('organizer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('secret123');
  await page.getByLabel('Confirm Password').fill('secret123');
  await page.getByRole('button', { name: /Organizer/ }).click();
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/login$/);
  expect(registerBody).toMatchObject({
    email: 'organizer@example.com',
    name: 'Organizer One',
    role: 'ORGANIZER',
  });
});

test('registration defaults to Customer role for ticket buyers', async ({ page }) => {
  let registerBody: Record<string, unknown> | undefined;

  await page.route(`${apiBase}/auth/register`, async (route) => {
    registerBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      json: {
        data: {
          message: 'User registered successfully',
          user: {
            id: 'customer-1',
            email: registerBody.email,
            name: registerBody.name,
            role: registerBody.role,
            createdAt: '2026-06-30T10:00:00.000Z',
            updatedAt: '2026-06-30T10:00:00.000Z',
          },
        },
      },
    });
  });

  await page.goto('/register');
  await expect(page.getByRole('button', { name: /Customer/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: /Organizer/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByLabel('Name').fill('Customer One');
  await page.getByLabel('Email').fill('customer@example.com');
  await page.getByLabel('Password', { exact: true }).fill('secret123');
  await page.getByLabel('Confirm Password').fill('secret123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/login$/);
  expect(registerBody).toMatchObject({
    email: 'customer@example.com',
    name: 'Customer One',
    role: 'USER',
  });
});

test('organizer registration link preselects Organizer role', async ({ page }) => {
  let registerBody: Record<string, unknown> | undefined;

  await page.route(`${apiBase}/auth/register`, async (route) => {
    registerBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      json: {
        data: {
          message: 'User registered successfully',
          user: {
            id: 'organizer-1',
            email: registerBody.email,
            name: registerBody.name,
            role: registerBody.role,
            createdAt: '2026-06-30T10:00:00.000Z',
            updatedAt: '2026-06-30T10:00:00.000Z',
          },
        },
      },
    });
  });

  await page.goto('/register?role=organizer');
  await expect(page.getByRole('button', { name: /Organizer/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: /Customer/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByLabel('Name').fill('Organizer Link');
  await page.getByLabel('Email').fill('organizer-link@example.com');
  await page.getByLabel('Password', { exact: true }).fill('secret123');
  await page.getByLabel('Confirm Password').fill('secret123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/login$/);
  expect(registerBody).toMatchObject({
    email: 'organizer-link@example.com',
    name: 'Organizer Link',
    role: 'ORGANIZER',
  });
});

test('login routes customer accounts to the ticket marketplace', async ({ page }) => {
  await mockApiEnvelope(page);

  let loginBody: Record<string, unknown> | undefined;
  await page.route(`${apiBase}/auth/login`, async (route) => {
    loginBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      json: {
        data: {
          access_token: 'token-USER',
          user: {
            id: 'customer-1',
            email: loginBody.email,
            name: 'Customer One',
            role: 'USER',
          },
        },
      },
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('customer@example.com');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole('heading', { name: 'Events near you' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'My tickets' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Organizer' })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('accessToken')))
    .toBe('token-USER');
  expect(loginBody).toMatchObject({
    email: 'customer@example.com',
    password: 'secret123',
  });
});

test('login routes organizer accounts to the organizer workspace', async ({ page }) => {
  await mockApiEnvelope(page);

  let loginBody: Record<string, unknown> | undefined;
  await page.route(`${apiBase}/auth/login`, async (route) => {
    loginBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      json: {
        data: {
          access_token: 'token-ORGANIZER',
          user: {
            id: 'organizer-1',
            email: loginBody.email,
            name: 'Organizer One',
            role: 'ORGANIZER',
          },
        },
      },
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('organizer@example.com');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/organizer\/events$/);
  await expect(page.getByRole('heading', { name: 'Create listing' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Events' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Check-in' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('link', { name: 'My tickets' })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('accessToken')))
    .toBe('token-ORGANIZER');
  expect(loginBody).toMatchObject({
    email: 'organizer@example.com',
    password: 'secret123',
  });
});

test('auth entry screens explain customer and organizer journeys', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Customer accounts book tickets and manage passes.')).toBeVisible();
  await expect(page.getByText('Opens the marketplace, checkout, and ticket wallet.')).toBeVisible();
  await expect(page.getByText('Opens event listings, bookings, and check-in tools.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create one' })).toHaveAttribute(
    'href',
    '/register',
  );
  await expectNoPageHorizontalOverflow(page);

  await page.goto('/login?role=organizer');
  await expect(
    page.getByRole('heading', { name: 'Sign in to organizer workspace' }),
  ).toBeVisible();
  await expect(
    page.getByText('Continue to event listings, booking manifests, and check-in tools.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create organizer account' })).toHaveAttribute(
    'href',
    '/register?role=organizer',
  );
  await expectNoPageHorizontalOverflow(page);

  await page.goto('/register');
  await expect(page.getByRole('heading', { name: 'Join Evento' })).toBeVisible();
  await expect(
    page.getByText('Each account lands in a separate workspace after sign in.'),
  ).toBeVisible();
  await expect(
    page.getByText('Browse events, book tickets, and manage wallet passes'),
  ).toBeVisible();
  await expect(
    page.getByText('Create listings, review bookings, and check in guests'),
  ).toBeVisible();
  await expectNoPageHorizontalOverflow(page);
});

test('customer booking path posts ticket quantity with auth header', async ({ page }) => {
  await mockApiEnvelope(page);

  let purchaseBody: Record<string, unknown> | undefined;
  let authHeader: string | null = null;
  await page.route(`${apiBase}/tickets/purchase`, async (route) => {
    purchaseBody = route.request().postDataJSON() as Record<string, unknown>;
    authHeader = route.request().headers().authorization ?? null;
    await route.fulfill({
      json: {
        data: {
          message: 'Ticket purchased successfully',
          ticket: {
            id: 'ticket-1',
            ticketCode: 'ABC123',
            eventTitle: 'Launch Night',
            quantity: purchaseBody.quantity,
            totalPrice: 300000,
            status: 'CONFIRMED',
            purchasedAt: '2026-06-30T10:00:00.000Z',
          },
        },
      },
    });
  });

  await seedAuth(page, 'USER', '/events');
  await expect(page.getByRole('heading', { name: 'Events near you' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Book featured event' })).toBeVisible();
  await page.getByRole('link', { name: /Book now/ }).first().click();
  await expect(page).toHaveURL(new RegExp(`/events/${event.id}$`));
  await expect(page.getByRole('heading', { name: 'Book tickets' })).toBeVisible();
  await expect(page.getByText("You're booking")).toBeVisible();
  await expect(page.getByText('165 seats available')).toBeVisible();
  await expect(page.getByText('35 booked of 200')).toBeVisible();
  await expect(page.getByText('Mobile entry pass')).toBeVisible();
  await expect(page.getByText('Entry code issued after booking')).toBeVisible();
  await expect(page.getByText('Scan at the gate')).toBeVisible();
  await expect(page.getByText(/INR\s*1,500\.00/).first()).toBeVisible();
  await expect(page.getByText('Convenience fee', { exact: true })).toBeVisible();
  await expect(page.getByText('No extra convenience fee')).toBeVisible();
  await page.getByRole('button', { name: 'Increase ticket quantity' }).click();
  await page.getByRole('button', { name: 'Confirm booking' }).click();

  await expect(page).toHaveURL(/\/tickets\?booking=confirmed/);
  const bookingConfirmation = page.getByRole('region', {
    name: 'Booking confirmation',
  });
  await expect(
    bookingConfirmation.getByRole('heading', { name: 'Booking confirmed' }),
  ).toBeVisible();
  await expect(
    bookingConfirmation.getByText('2 tickets saved to your wallet for Launch Night.'),
  ).toBeVisible();
  await expect(bookingConfirmation.getByText('ABC123')).toBeVisible();
  expect(purchaseBody).toMatchObject({
    eventId: event.id,
    quantity: 2,
  });
  expect(authHeader).toBe('Bearer token-USER');
});

test('marketplace filters events by city and resets discovery controls', async ({ page }) => {
  await mockApiEnvelope(page, { publishedEvents: [event, workshopEvent] });

  await page.goto('/events');
  await expect(page.getByTestId('event-card-title')).toHaveText([
    'Launch Night',
    'Design Workshop',
  ]);
  await expect(page.getByText('165 seats available')).toHaveCount(2);
  await expect(page.getByText('10 seats left')).toBeVisible();
  await expect(page.getByText('Showing 2 of 2 events')).toBeVisible();

  await page.getByLabel('City').selectOption('Bengaluru');

  await expect(page.getByTestId('event-card-title')).toHaveText(['Design Workshop']);
  await expect(page.getByText('Srishti Auditorium, Bengaluru')).toBeVisible();
  await expect(page.getByText('10 seats left')).toHaveCount(2);
  await expect(page.getByText('Showing 1 of 2 events')).toBeVisible();

  await page.getByRole('button', { name: 'Reset filters' }).click();

  await expect(page.getByTestId('event-card-title')).toHaveText([
    'Launch Night',
    'Design Workshop',
  ]);
  await expect(page.getByLabel('City')).toHaveValue('All');
});

test('marketplace filters events by organizer-selected category', async ({ page }) => {
  await mockApiEnvelope(page, { publishedEvents: [event, workshopEvent] });

  await page.goto('/events');
  await page.getByRole('button', { name: 'Workshops' }).click();

  await expect(page.getByTestId('event-card-title')).toHaveText(['Design Workshop']);
  await expect(page.getByText('Showing 1 of 2 events')).toBeVisible();
});

test('marketplace filters by month and sorts by price', async ({ page }) => {
  await mockApiEnvelope(page, { publishedEvents: [event, workshopEvent] });

  await page.goto('/events');

  await page.getByLabel('Sort').selectOption('price-desc');
  await expect(page.getByTestId('event-card-title')).toHaveText([
    'Design Workshop',
    'Launch Night',
  ]);

  await page.getByLabel('Sort').selectOption('price-asc');
  await expect(page.getByTestId('event-card-title')).toHaveText([
    'Launch Night',
    'Design Workshop',
  ]);

  await page.getByLabel('Date').selectOption('2026-08');

  await expect(page.getByTestId('event-card-title')).toHaveText(['Design Workshop']);
  await expect(page.getByText('Showing 1 of 2 events')).toBeVisible();
});

test('sold out event detail disables checkout', async ({ page }) => {
  await mockApiEnvelope(page, { publishedEvents: [soldOutEvent] });

  let purchaseRequested = false;
  await page.route(`${apiBase}/tickets/purchase`, async (route) => {
    purchaseRequested = true;
    await route.fulfill({ status: 400, json: { data: null } });
  });

  await seedAuth(page, 'USER', `/events/${soldOutEvent.id}`);

  await expect(page.getByText('80 booked of 80')).toBeVisible();
  await expect(page.getByText('No tickets available for this showtime.')).toBeVisible();
  await expect(page.getByText(/Up to 0 tickets per booking/)).toHaveCount(0);
  await expect(page.getByText('This event is currently sold out.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm booking' })).toBeDisabled();
  expect(purchaseRequested).toBe(false);
});

test('unauthenticated ticketing routes ask for the right sign-in path', async ({ page }) => {
  await mockApiEnvelope(page);

  await page.goto('/events');
  await page.getByRole('link', { name: /Book now/ }).first().click();
  await page.getByRole('button', { name: 'Sign in to continue' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/tickets');
  await expect(page.getByText('Sign in to open your wallet')).toBeVisible();

  await page.goto('/organizer/check-in');
  await expect(page.getByText('Sign in as an organizer')).toBeVisible();
});

test('organizer cannot purchase from customer marketplace', async ({ page }) => {
  await mockApiEnvelope(page);

  let purchaseRequested = false;
  await page.route(`${apiBase}/tickets/purchase`, async (route) => {
    purchaseRequested = true;
    await route.fulfill({ status: 403, json: { data: null } });
  });

  await seedAuth(page, 'ORGANIZER', `/events/${event.id}`);
  const buyButton = page.getByRole('button', { name: 'Customer account required' });
  await expect(buyButton).toBeDisabled();
  expect(purchaseRequested).toBe(false);
});

test('organizer check-in path posts ticket code with auth header', async ({ page }) => {
  await mockApiEnvelope(page);

  let checkInBody: Record<string, unknown> | undefined;
  let authHeader: string | null = null;
  await page.route(`${apiBase}/tickets/check-in`, async (route) => {
    checkInBody = route.request().postDataJSON() as Record<string, unknown>;
    authHeader = route.request().headers().authorization ?? null;
    await route.fulfill({
      json: {
        data: {
          message: 'Ticket checked in successfully',
        },
      },
    });
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/check-in');
  await expect(page.getByRole('heading', { name: 'Door check-in' })).toBeVisible();
  await page.getByLabel('Ticket code').fill('ABC123');
  await page.getByRole('button', { name: 'Check in' }).click();

  await expect.poll(() => checkInBody).toMatchObject({ ticketCode: 'ABC123' });
  await expect.poll(() => authHeader).toBe('Bearer token-ORGANIZER');
});

test('customer navigation does not expose organizer or ops links', async ({ page }) => {
  await mockApiEnvelope(page);

  await seedAuth(page, 'USER', '/events');

  const navigation = page.getByRole('navigation');
  await expect(navigation.getByRole('link', { name: 'Browse' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'My tickets' })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Organizer' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'System' })).toHaveCount(0);
});

test('customer booking routes keep Kafka details out of the product UI', async ({ page }) => {
  await mockApiEnvelope(page, { tickets: [walletTicket] });

  await seedAuth(page, 'USER', '/events');

  await expect(page.getByRole('heading', { name: 'Events near you' })).toBeVisible();
  await expect(page.getByText(/Kafka|Runtime map|event stream/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'System' })).toHaveCount(0);

  await page.goto('/tickets');

  await expect(page.getByRole('heading', { name: 'Your tickets' })).toBeVisible();
  await expect(page.getByText(/Kafka|Runtime map|event stream/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'System' })).toHaveCount(0);
});

test('customer sign out clears session and locks wallet access', async ({ page }) => {
  await mockApiEnvelope(page, { tickets: [walletTicket] });

  await seedAuth(page, 'USER', '/tickets');

  await expect(page.getByRole('heading', { name: 'Your tickets' })).toBeVisible();
  await expect(page.getByText('EVT-9K2M-ABC123')).toHaveCount(2);
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page.getByText('Sign in to open your wallet')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
  await expect(page.getByText('EVT-9K2M-ABC123')).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('accessToken')))
    .toBeNull();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const value = window.localStorage.getItem('auth-storage');
        return value ? JSON.parse(value).state.isAuthenticated : null;
      }),
    )
    .toBe(false);
});

test('customer ticket wallet renders entry code and QR pass', async ({ page }) => {
  await mockApiEnvelope(page, { tickets: [walletTicket] });

  await seedAuth(page, 'USER', '/tickets');

  await expect(page.getByRole('heading', { name: 'Your tickets' })).toBeVisible();
  await expect(page.getByText('Launch Night')).toBeVisible();
  await expect(page.locator('span', { hasText: 'Ready for entry' })).toBeVisible();
  await expect(page.getByText('3 tickets')).toBeVisible();
  await expect(page.getByText(/INR\s*4,500\.00/)).toHaveCount(2);
  await expect(page.getByText('EVT-9K2M-ABC123')).toHaveCount(2);
  await expect(
    page.getByRole('img', { name: 'QR code for EVT-9K2M-ABC123' }),
  ).toBeVisible();
});

test('customer ticket wallet cancels confirmed tickets only', async ({ page }) => {
  const checkedInTicket = {
    ...walletTicket,
    id: 'ticket-checked-in',
    ticketCode: 'EVT-CHECKED-IN',
    status: 'CHECKED_IN' as const,
    checkedInAt: '2026-07-20T19:30:00.000Z',
  };
  await mockApiEnvelope(page, { tickets: [walletTicket, checkedInTicket] });

  let cancelAuthHeader: string | null = null;
  await page.route(`${apiBase}/tickets/${walletTicket.id}/cancel`, async (route) => {
    cancelAuthHeader = route.request().headers().authorization ?? null;
    await route.fulfill({ json: { data: { message: 'Ticket cancelled successfully' } } });
  });

  await seedAuth(page, 'USER', '/tickets');

  await page.getByRole('button', { name: 'Cancel ticket EVT-9K2M-ABC123' }).click();
  await expect(page.getByText('Cancel this ticket?')).toBeVisible();
  await expect(page.getByText('This removes the pass from your wallet.')).toBeVisible();
  await page.getByRole('button', { name: 'Keep ticket' }).click();
  await expect(page.getByText('Cancel this ticket?')).toHaveCount(0);
  expect(cancelAuthHeader).toBeNull();

  await page.getByRole('button', { name: 'Cancel ticket EVT-9K2M-ABC123' }).click();
  await page
    .getByRole('button', { name: 'Confirm cancellation for ticket EVT-9K2M-ABC123' })
    .click();

  await expect.poll(() => cancelAuthHeader).toBe('Bearer token-USER');
  await expect(page.getByText('Only confirmed tickets can be cancelled.')).toBeVisible();
});

test('customer opening organizer route sees access required state', async ({ page }) => {
  await mockApiEnvelope(page);

  await seedAuth(page, 'USER', '/organizer/events');

  await expect(page.getByText('Organizer access required')).toBeVisible();
  await expect(page.getByText(/Customer accounts can browse events/)).toBeVisible();
  await expect(page.getByText('Create listing')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create draft' })).toHaveCount(0);
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Check-in' }),
  ).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Return to Browse' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open My tickets' })).toBeVisible();

  await page.getByRole('link', { name: 'Return to Browse' }).click();
  await expect(page).toHaveURL(/\/events$/);
});

test('organizer sign out clears session and locks organizer tools', async ({ page }) => {
  await mockApiEnvelope(page, { myEvents: [event] });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');

  await expect(page.getByRole('heading', { name: 'Create listing' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create draft' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page.getByText('Sign in as an organizer')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in as organizer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Sign in as organizer' })).toHaveAttribute(
    'href',
    '/login?role=organizer',
  );
  await expect(page.getByRole('link', { name: 'Create organizer account' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Create organizer account' })).toHaveAttribute(
    'href',
    '/register?role=organizer',
  );
  await expect(page.getByRole('button', { name: 'Create draft' })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('accessToken')))
    .toBeNull();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const value = window.localStorage.getItem('auth-storage');
        return value ? JSON.parse(value).state.isAuthenticated : null;
      }),
    )
    .toBe(false);
});

test('organizer create-listing path posts event details with auth header', async ({ page }) => {
  let createBody: Record<string, unknown> | undefined;
  let authHeader: string | null = null;
  await mockApiEnvelope(page, {
    createEvent: (body, requestAuthHeader) => {
      createBody = body;
      authHeader = requestAuthHeader;

      return {
        ...event,
        ...body,
        id: 'created-event-1',
        status: 'DRAFT',
        organizerId: 'organizer-1',
        createdAt: '2026-06-30T10:00:00.000Z',
        updatedAt: '2026-06-30T10:00:00.000Z',
      };
    },
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');
  const listingPreview = page.getByRole('region', { name: 'Listing preview' });
  await expect(listingPreview.getByText('Untitled listing')).toBeVisible();
  await expect(listingPreview.getByText('1/8 ready')).toBeVisible();
  await page.getByLabel('Event name').fill('Design Leaders Night');
  await page.getByLabel('Description').fill('Talks and networking for design leaders.');
  await page.getByLabel('Date').fill('2026-07-21T19:30');
  await page.getByLabel('Venue').fill('BKC Arts Center');
  await page.getByLabel('City').fill('Mumbai');
  await page.getByLabel('Category').selectOption('Workshops');
  await page.getByLabel('Seats').fill('180');
  await page.getByLabel('Price').fill('2550');
  await expect(listingPreview.getByText('Design Leaders Night')).toBeVisible();
  await expect(listingPreview.getByText('BKC Arts Center, Mumbai')).toBeVisible();
  await expect(listingPreview.getByText('180 seats')).toBeVisible();
  await expect(listingPreview.getByText(/INR\s*2,550\.00/)).toBeVisible();
  await expect(listingPreview.getByText('8/8 ready')).toBeVisible();
  await page.getByRole('button', { name: 'Create draft' }).click();

  await expect.poll(() => createBody).toMatchObject({
    title: 'Design Leaders Night',
    description: 'Talks and networking for design leaders.',
    location: 'BKC Arts Center',
    city: 'Mumbai',
    category: 'Workshops',
    capacity: 180,
    price: 255000,
  });
  expect(String(createBody?.date)).toContain('2026-07-21T');
  await expect.poll(() => authHeader).toBe('Bearer token-ORGANIZER');
});

test('organizer publishes draft listing with auth header', async ({ page }) => {
  await mockApiEnvelope(page, { myEvents: [draftEvent] });

  let publishAuthHeader: string | null = null;
  await page.route(`${apiBase}/events/${draftEvent.id}/publish`, async (route) => {
    publishAuthHeader = route.request().headers().authorization ?? null;
    await route.fulfill({
      json: {
        data: {
          ...draftEvent,
          status: 'PUBLISHED',
        },
      },
    });
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');
  await page.getByRole('button', { name: 'Publish' }).click();

  await expect.poll(() => publishAuthHeader).toBe('Bearer token-ORGANIZER');
});

test('organizer edits draft listing before publishing', async ({ page }) => {
  let updateBody: Record<string, unknown> | undefined;
  let updateAuthHeader: string | null = null;
  await mockApiEnvelope(page, {
    myEvents: [draftEvent],
    updateEvent: (body, requestAuthHeader) => {
      updateBody = body;
      updateAuthHeader = requestAuthHeader;

      return {
        ...draftEvent,
        ...body,
        updatedAt: '2026-06-30T11:00:00.000Z',
      };
    },
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');
  await page.getByRole('button', { name: 'Edit draft' }).click();

  await expect(page.getByRole('heading', { name: 'Edit listing' })).toBeVisible();
  await expect(page.getByLabel('Event name')).toHaveValue('Draft Circle');
  await page.getByLabel('Event name').fill('Draft Circle Revised');
  await page.getByLabel('City').fill('Pune');
  await page.getByLabel('Category').selectOption('Startup meetups');
  await page.getByLabel('Seats').fill('220');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect.poll(() => updateBody).toMatchObject({
    title: 'Draft Circle Revised',
    city: 'Pune',
    category: 'Startup meetups',
    capacity: 220,
    price: 255000,
  });
  await expect.poll(() => updateAuthHeader).toBe('Bearer token-ORGANIZER');
});

test('organizer cancels listing with auth header', async ({ page }) => {
  await mockApiEnvelope(page, { myEvents: [event] });

  let cancelAuthHeader: string | null = null;
  let cancelRequests = 0;
  await page.route(`${apiBase}/events/${event.id}/cancel`, async (route) => {
    cancelRequests += 1;
    cancelAuthHeader = route.request().headers().authorization ?? null;
    await route.fulfill({
      json: {
        data: {
          ...event,
          status: 'CANCELLED',
        },
      },
    });
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');

  await page.getByRole('button', { name: 'Cancel listing Launch Night' }).click();
  await expect(page.getByText('Cancel this listing?')).toBeVisible();
  await expect(page.getByText('Existing customer tickets will be cancelled.')).toBeVisible();
  await page.getByRole('button', { name: 'Keep listing' }).click();
  await expect(page.getByText('Cancel this listing?')).toHaveCount(0);
  expect(cancelRequests).toBe(0);
  expect(cancelAuthHeader).toBeNull();

  await page.getByRole('button', { name: 'Cancel listing Launch Night' }).click();
  await page
    .getByRole('button', { name: 'Confirm cancellation for Launch Night' })
    .click();

  await expect.poll(() => cancelRequests).toBe(1);
  await expect.poll(() => cancelAuthHeader).toBe('Bearer token-ORGANIZER');
});

test('organizer views event booking manifest with auth header', async ({ page }) => {
  let manifestAuthHeader: string | null = null;
  await mockApiEnvelope(page, {
    myEvents: [event],
    eventTickets: [walletTicket],
    onEventTicketsRequest: (authHeader) => {
      manifestAuthHeader = authHeader;
    },
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');
  await page.getByRole('button', { name: 'View bookings' }).click();

  await expect(page.getByText('Booking manifest')).toBeVisible();
  await expect(
    page.getByText('Customer bookings and entry codes for this listing.'),
  ).toBeVisible();
  await expect(page.getByText('EVT-9K2M-ABC123')).toBeVisible();
  await expect(page.getByText('Customer One')).toBeVisible();
  await expect(page.getByText('customer@example.com')).toBeVisible();
  await expect(page.getByText('3 tickets')).toBeVisible();
  await expect(page.getByText(/INR\s*4,500\.00/)).toHaveCount(2);
  await expect.poll(() => manifestAuthHeader).toBe('Bearer token-ORGANIZER');
});

test('demo script smoke: organizer publish to customer booking to check-in', async ({
  page,
}) => {
  const publishedEvents: MockEvent[] = [];
  const myEvents: MockEvent[] = [];
  const tickets: MockTicket[] = [];
  const eventTickets: MockTicket[] = [];
  let publishAuthHeader: string | null = null;
  let purchaseAuthHeader: string | null = null;
  let checkInAuthHeader: string | null = null;
  let checkInBody: Record<string, unknown> | undefined;

  await mockApiEnvelope(page, {
    publishedEvents,
    myEvents,
    tickets,
    eventTickets,
    createEvent: (body) => {
      const createdEvent = {
        ...event,
        ...body,
        id: event.id,
        status: 'DRAFT',
        soldTickets: 0,
        remainingCapacity: Number(body.capacity),
        organizerId: 'organizer-1',
        createdAt: '2026-06-30T10:00:00.000Z',
        updatedAt: '2026-06-30T10:00:00.000Z',
      } satisfies MockEvent;

      myEvents.splice(0, myEvents.length, createdEvent);
      return createdEvent;
    },
  });

  await page.route(`${apiBase}/events/${event.id}/publish`, async (route) => {
    publishAuthHeader = route.request().headers().authorization ?? null;
    const publishedEvent = {
      ...(myEvents[0] ?? event),
      status: 'PUBLISHED',
      soldTickets: 0,
      remainingCapacity: myEvents[0]?.capacity ?? event.capacity,
      updatedAt: '2026-06-30T10:15:00.000Z',
    } satisfies MockEvent;

    myEvents.splice(0, myEvents.length, publishedEvent);
    publishedEvents.splice(0, publishedEvents.length, publishedEvent);
    await route.fulfill({ json: { data: publishedEvent } });
  });

  await page.route(`${apiBase}/tickets/purchase`, async (route) => {
    purchaseAuthHeader = route.request().headers().authorization ?? null;
    const body = route.request().postDataJSON() as Record<string, unknown>;
    const quantity = Number(body.quantity);
    const purchasedTicket: MockTicket = {
      ...walletTicket,
      id: 'demo-ticket-1',
      ticketCode: 'EVT-DEMO-2026',
      eventId: event.id,
      eventTitle: 'Launch Night',
      quantity,
      totalPrice: event.price * quantity,
      userName: 'Customer',
      userEmail: 'customer@example.com',
    };

    tickets.splice(0, tickets.length, purchasedTicket);
    eventTickets.splice(0, eventTickets.length, purchasedTicket);
    await route.fulfill({
      json: {
        data: {
          message: 'Ticket purchased successfully',
          ticket: purchasedTicket,
        },
      },
    });
  });

  await page.route(`${apiBase}/tickets/check-in`, async (route) => {
    checkInAuthHeader = route.request().headers().authorization ?? null;
    checkInBody = route.request().postDataJSON() as Record<string, unknown>;
    const ticket = tickets[0];

    if (ticket) {
      ticket.status = 'CHECKED_IN';
      ticket.checkedInAt = '2026-07-20T19:30:00.000Z';
    }

    await route.fulfill({
      json: { data: { message: 'Ticket checked in successfully' } },
    });
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');
  await page.getByLabel('Event name').fill('Launch Night');
  await page.getByLabel('Description').fill('A curated evening of talks and music.');
  await page.getByLabel('Date').fill('2026-07-20T18:30');
  await page.getByLabel('Venue').fill('Mumbai Arena');
  await page.getByLabel('City').fill('Mumbai');
  await page.getByLabel('Category').selectOption('Live shows');
  await page.getByLabel('Seats').fill('200');
  await page.getByLabel('Price').fill('1500');
  await expect(page.getByRole('region', { name: 'Listing preview' })).toContainText(
    '8/8 ready',
  );
  await page.getByRole('button', { name: 'Create draft' }).click();
  await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
  await page.getByRole('button', { name: 'Publish' }).click();

  await expect.poll(() => publishAuthHeader).toBe('Bearer token-ORGANIZER');

  await page.evaluate(() => window.localStorage.clear());
  await seedAuth(page, 'USER', '/events');
  await expect(page.getByRole('heading', { name: 'Events near you' })).toBeVisible();
  await page.getByRole('link', { name: /Book now/ }).first().click();
  await page.getByRole('button', { name: 'Increase ticket quantity' }).click();
  await page.getByRole('button', { name: 'Confirm booking' }).click();

  await expect(page).toHaveURL(/\/tickets\?booking=confirmed/);
  const bookingConfirmation = page.getByRole('region', {
    name: 'Booking confirmation',
  });
  await expect(
    bookingConfirmation.getByText('2 tickets saved to your wallet for Launch Night.'),
  ).toBeVisible();
  await expect(bookingConfirmation.getByText('EVT-DEMO-2026')).toBeVisible();
  await expect.poll(() => purchaseAuthHeader).toBe('Bearer token-USER');

  await page.evaluate(() => window.localStorage.clear());
  await seedAuth(page, 'ORGANIZER', '/organizer/events');
  await page.getByRole('button', { name: 'View bookings' }).click();
  await expect(page.getByText('Booking manifest')).toBeVisible();
  await expect(page.getByText('Customer', { exact: true })).toBeVisible();
  await expect(page.getByText('customer@example.com')).toBeVisible();
  await expect(page.getByText('2 tickets')).toBeVisible();
  await expect(page.getByText('EVT-DEMO-2026').first()).toBeVisible();

  await page.goto('/organizer/check-in');
  await page.getByLabel('Ticket code').fill('EVT-DEMO-2026');
  await page.getByRole('button', { name: 'Check in' }).click();

  await expect.poll(() => checkInAuthHeader).toBe('Bearer token-ORGANIZER');
  await expect.poll(() => checkInBody).toMatchObject({ ticketCode: 'EVT-DEMO-2026' });
});

test('organizer routes keep Kafka details in admin operations only', async ({ page }) => {
  await mockApiEnvelope(page, { myEvents: [event] });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');

  await expect(page.getByRole('heading', { name: 'Create listing' })).toBeVisible();
  await expect(page.getByText(/Kafka|Runtime map|event stream/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'System' })).toHaveCount(0);

  await page.goto('/organizer/check-in');

  await expect(page.getByRole('heading', { name: 'Door check-in' })).toBeVisible();
  await expect(page.getByText(/Kafka|Runtime map|event stream/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'System' })).toHaveCount(0);
});

test('system operations surface is admin-only', async ({ page }) => {
  await mockApiEnvelope(page);

  await seedAuth(page, 'USER', '/ops');
  await expect(page.getByText('System access required')).toBeVisible();
  await expect(page.getByText('Kafka event stream')).toHaveCount(0);

  await page.evaluate(() => window.localStorage.clear());
  await seedAuth(page, 'ADMIN', '/ops');
  await expect(page.getByRole('heading', { name: 'Operations' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Runtime map' })).toBeVisible();
  await expect(page.getByText('Kafka contracts')).toBeVisible();
  await expect(page.getByText('Notification flows verified by tests')).toBeVisible();
  await expect(page.getByText('Kafka event stream')).toBeVisible();
  await expect(page.getByText('Kafka events')).toBeVisible();
  await expect(page.getByText('Email workflows consume Kafka event payloads')).toBeVisible();
  await expect(page.getByText('Kafka + Mail')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Kafka UI/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Mailhog/ })).toHaveCount(0);
});

test('mobile customer marketplace and checkout stay organized', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApiEnvelope(page, { publishedEvents: [event, workshopEvent] });

  await seedAuth(page, 'USER', '/events');

  await expect(page.getByRole('heading', { name: 'Events near you' })).toBeVisible();
  await expect(page.getByLabel('City')).toBeVisible();
  await expect(page.getByLabel('Date')).toBeVisible();
  await expect(page.getByRole('link', { name: /Book now/ }).first()).toBeVisible();
  await expect(page.getByText('Showing 2 of 2 events')).toBeVisible();
  await expectNoPageHorizontalOverflow(page);

  await page.getByRole('link', { name: /Book now/ }).first().click();

  await expect(page).toHaveURL(new RegExp(`/events/${event.id}$`));
  await expect(page.getByRole('heading', { name: 'Book tickets' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Decrease ticket quantity' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Increase ticket quantity' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirm booking' })).toBeVisible();
  await expectNoPageHorizontalOverflow(page);
});

test('mobile organizer workspace keeps creation and bookings usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApiEnvelope(page, {
    myEvents: [event],
    eventTickets: [walletTicket],
  });

  await seedAuth(page, 'ORGANIZER', '/organizer/events');

  await expect(page.getByRole('heading', { name: 'Create listing' })).toBeVisible();
  await expect(page.getByLabel('Event name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create draft' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View bookings' })).toBeVisible();
  await expectNoPageHorizontalOverflow(page);

  await page.getByRole('button', { name: 'View bookings' }).click();

  await expect(page.getByText('Booking manifest')).toBeVisible();
  await expect(page.getByText('Customer bookings and entry codes for this listing.')).toBeVisible();
  await expect(page.getByText('EVT-9K2M-ABC123')).toBeVisible();
  await expectNoPageHorizontalOverflow(page);
});
