import { getRedisConnectionOptions } from './throttler-storage-redis';

describe('getRedisConnectionOptions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults to localhost for no-Docker local development', () => {
    expect(getRedisConnectionOptions()).toEqual({
      host: 'localhost',
      port: 6379,
    });
  });

  it('uses explicit Redis host and port overrides', () => {
    process.env.REDIS_HOST = 'cache.internal';
    process.env.REDIS_PORT = '6380';

    expect(getRedisConnectionOptions()).toEqual({
      host: 'cache.internal',
      port: 6380,
    });
  });
});
