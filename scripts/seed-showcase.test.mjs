import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcrypt';
import {
  getDatabaseUrl,
  getShowcaseSeedContract,
  getShowcaseSeedSummary,
  seedShowcase,
} from './seed-showcase.mjs';

function createLogger() {
  const lines = [];

  return {
    lines,
    log: (line) => lines.push(String(line)),
  };
}

function createPoolDouble({ failAtQuery } = {}) {
  const queries = [];
  const client = {
    query: async (sql, params) => {
      const queryNumber = queries.length + 1;
      const normalizedSql = String(sql).replace(/\s+/g, ' ').trim();
      queries.push({ sql: normalizedSql, params });

      if (failAtQuery === queryNumber) {
        throw new Error(`query ${queryNumber} failed`);
      }
    },
    releaseCalled: false,
    release() {
      this.releaseCalled = true;
    },
  };
  const pool = {
    connectionString: undefined,
    connectCalled: false,
    endCalled: false,
    async connect() {
      this.connectCalled = true;
      return client;
    },
    async end() {
      this.endCalled = true;
    },
  };

  return {
    client,
    pool,
    queries,
    createPool(connectionString) {
      pool.connectionString = connectionString;
      return pool;
    },
  };
}

test('getDatabaseUrl uses DATABASE_URL when present', () => {
  assert.equal(
    getDatabaseUrl({ DATABASE_URL: 'postgresql://custom.local/evento' }),
    'postgresql://custom.local/evento',
  );
});

test('getDatabaseUrl falls back to the documented local database URL', () => {
  assert.equal(
    getDatabaseUrl({}),
    'postgresql://eventoapp:evento_password@localhost:5432/eventoapp?schema=public',
  );
});

test('dry-run logs the showcase summary without opening a database connection', async () => {
  const logger = createLogger();
  let poolCreated = false;
  const summary = await seedShowcase({
    dryRun: true,
    logger,
    createPool: () => {
      poolCreated = true;
      throw new Error('pool should not be created during dry-run');
    },
  });

  assert.deepEqual(summary, getShowcaseSeedSummary());
  assert.equal(poolCreated, false);
  assert.match(logger.lines.join('\n'), /organizer@evento\.local/);
  assert.match(logger.lines.join('\n'), /Dry run complete/);
});

test('showcase contract matches app enums and wallet arithmetic', () => {
  const contract = getShowcaseSeedContract();
  const roles = contract.users.map((user) => user.role);

  assert.deepEqual(roles, ['ORGANIZER', 'USER', 'ADMIN']);
  assert.equal(contract.event.status, 'PUBLISHED');
  assert.equal(contract.ticket.status, 'CONFIRMED');
  assert.equal(contract.ticket.ticketCode.length <= 20, true);
  assert.equal(
    contract.ticket.totalPrice,
    contract.event.price * contract.ticket.quantity,
  );
  assert.equal(contract.ticket.eventId, contract.event.id);
  assert.equal(contract.ticket.userId, contract.users[1].id);
  assert.equal(contract.event.organizerId, contract.users[0].id);
});

test('showcase password contract is compatible with bcrypt login checks', async () => {
  const { password } = getShowcaseSeedContract();
  const hash = await bcrypt.hash(password, 10);

  assert.equal(await bcrypt.compare(password, hash), true);
});

test('seedShowcase writes scoped data in dependency-safe order', async () => {
  const logger = createLogger();
  const poolDouble = createPoolDouble();

  await seedShowcase({
    databaseUrl: 'postgresql://seed.local/evento',
    logger,
    createPool: poolDouble.createPool,
    hashPassword: async () => '$2b$10$showcaseHash',
  });

  assert.equal(poolDouble.pool.connectionString, 'postgresql://seed.local/evento');
  assert.equal(poolDouble.pool.connectCalled, true);
  assert.equal(poolDouble.client.releaseCalled, true);
  assert.equal(poolDouble.pool.endCalled, true);

  const sqlStatements = poolDouble.queries.map((query) => query.sql);
  assert.equal(sqlStatements[0], 'BEGIN');
  assert.match(sqlStatements[1], /^DELETE FROM tickets/);
  assert.match(sqlStatements[2], /^DELETE FROM events/);
  assert.match(sqlStatements[3], /^DELETE FROM users/);
  assert.match(sqlStatements[4], /^INSERT INTO users/);
  assert.match(sqlStatements[5], /^INSERT INTO users/);
  assert.match(sqlStatements[6], /^INSERT INTO users/);
  assert.match(sqlStatements[7], /^INSERT INTO events/);
  assert.match(sqlStatements[7], /organize_id/);
  assert.match(sqlStatements[8], /^INSERT INTO tickets/);
  assert.equal(sqlStatements[9], 'COMMIT');
  assert.match(logger.lines.join('\n'), /Showcase seed complete/);
});

test('seedShowcase rolls back and closes resources when a query fails', async () => {
  const logger = createLogger();
  const poolDouble = createPoolDouble({ failAtQuery: 5 });

  await assert.rejects(
    seedShowcase({
      logger,
      createPool: poolDouble.createPool,
      hashPassword: async () => '$2b$10$showcaseHash',
    }),
    /query 5 failed/,
  );

  assert.equal(poolDouble.queries.at(-1).sql, 'ROLLBACK');
  assert.equal(poolDouble.client.releaseCalled, true);
  assert.equal(poolDouble.pool.endCalled, true);
});
