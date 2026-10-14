import bcrypt from 'bcrypt';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const DEFAULT_DATABASE_URL =
  'postgresql://eventoapp:evento_password@localhost:5432/eventoapp?schema=public';

const showcasePassword = 'Evento@123';

const showcaseUsers = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    email: 'organizer@evento.local',
    name: 'Evento Organizer',
    role: 'ORGANIZER',
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    email: 'customer@evento.local',
    name: 'Evento Customer',
    role: 'USER',
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    email: 'admin@evento.local',
    name: 'Evento Admin',
    role: 'ADMIN',
  },
];

const showcaseEvent = {
  id: '00000000-0000-4000-8000-000000000201',
  title: 'Launch Night Live',
  description:
    'A polished evening of startup talks, live music, and product demos for the Evento showcase.',
  date: '2026-07-20T18:30:00.000Z',
  location: 'Mumbai Arena',
  city: 'Mumbai',
  category: 'Live shows',
  capacity: 200,
  price: 150000,
  status: 'PUBLISHED',
  organizerId: showcaseUsers[0].id,
};

const showcaseTicket = {
  id: '00000000-0000-4000-8000-000000000301',
  eventId: showcaseEvent.id,
  userId: showcaseUsers[1].id,
  quantity: 2,
  totalPrice: showcaseEvent.price * 2,
  status: 'CONFIRMED',
  ticketCode: 'EVT-SHOWCASE-26',
};

export function getShowcaseSeedSummary() {
  return {
    accounts: showcaseUsers.map(({ email, role }) => ({ email, role })),
    event: {
      title: showcaseEvent.title,
      status: showcaseEvent.status,
      city: showcaseEvent.city,
      capacity: showcaseEvent.capacity,
    },
    ticket: {
      ticketCode: showcaseTicket.ticketCode,
      quantity: showcaseTicket.quantity,
      status: showcaseTicket.status,
    },
  };
}

export function getDatabaseUrl(env = process.env) {
  return env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

export function getShowcaseSeedContract() {
  return {
    password: showcasePassword,
    users: showcaseUsers.map((user) => ({ ...user })),
    event: { ...showcaseEvent },
    ticket: { ...showcaseTicket },
  };
}

function logSummary(logger) {
  const summary = getShowcaseSeedSummary();

  logger.log('Showcase seed summary:');
  logger.log(`- Organizer: ${summary.accounts[0].email}`);
  logger.log(`- Customer: ${summary.accounts[1].email}`);
  logger.log(`- Admin: ${summary.accounts[2].email}`);
  logger.log(`- Password for all accounts: ${showcasePassword}`);
  logger.log(`- Published event: ${summary.event.title}`);
  logger.log(`- Confirmed ticket code: ${summary.ticket.ticketCode}`);
}

export async function seedShowcase({
  databaseUrl = getDatabaseUrl(),
  dryRun = false,
  logger = console,
  createPool = (connectionString) => new Pool({ connectionString }),
  hashPassword = (password) => bcrypt.hash(password, 10),
} = {}) {
  logSummary(logger);

  if (dryRun) {
    logger.log('Dry run complete. No database changes were made.');
    return getShowcaseSeedSummary();
  }

  const pool = createPool(databaseUrl);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const emails = showcaseUsers.map((user) => user.email);
    const ids = showcaseUsers.map((user) => user.id);
    const passwordHash = await hashPassword(showcasePassword);

    await client.query(
      `
        DELETE FROM tickets
        WHERE event_id = $1
           OR ticket_code = $2
           OR user_id IN (SELECT id FROM users WHERE email = ANY($3::text[]))
           OR user_id = ANY($4::uuid[])
      `,
      [showcaseEvent.id, showcaseTicket.ticketCode, emails, ids],
    );

    await client.query(
      `
        DELETE FROM events
        WHERE id = $1
           OR organize_id IN (SELECT id FROM users WHERE email = ANY($2::text[]))
           OR organize_id = ANY($3::uuid[])
      `,
      [showcaseEvent.id, emails, ids],
    );

    await client.query(
      `
        DELETE FROM users
        WHERE email = ANY($1::text[])
           OR id = ANY($2::uuid[])
      `,
      [emails, ids],
    );

    for (const user of showcaseUsers) {
      await client.query(
        `
          INSERT INTO users (id, email, password, name, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `,
        [user.id, user.email, passwordHash, user.name, user.role],
      );
    }

    await client.query(
      `
        INSERT INTO events (
          id,
          title,
          description,
          date,
          location,
          city,
          category,
          capacity,
          price,
          status,
          organize_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      `,
      [
        showcaseEvent.id,
        showcaseEvent.title,
        showcaseEvent.description,
        showcaseEvent.date,
        showcaseEvent.location,
        showcaseEvent.city,
        showcaseEvent.category,
        showcaseEvent.capacity,
        showcaseEvent.price,
        showcaseEvent.status,
        showcaseEvent.organizerId,
      ],
    );

    await client.query(
      `
        INSERT INTO tickets (
          id,
          event_id,
          user_id,
          quantity,
          total_price,
          status,
          ticket_code,
          purchased_at,
          checked_in_at,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NULL, NOW(), NOW())
      `,
      [
        showcaseTicket.id,
        showcaseTicket.eventId,
        showcaseTicket.userId,
        showcaseTicket.quantity,
        showcaseTicket.totalPrice,
        showcaseTicket.status,
        showcaseTicket.ticketCode,
      ],
    );

    await client.query('COMMIT');
    logger.log('Showcase seed complete.');
    return getShowcaseSeedSummary();
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dryRun = process.argv.includes('--dry-run');

  seedShowcase({ dryRun }).catch((error) => {
    console.error('Showcase seed failed:');
    console.error(error);
    process.exit(1);
  });
}
