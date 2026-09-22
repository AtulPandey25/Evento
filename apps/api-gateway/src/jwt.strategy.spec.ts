import { JwtStrategy } from './jwt.strategy';

describe('ApiGateway JwtStrategy', () => {
  it('preserves role from JWT payload for downstream service authorization', () => {
    const strategy = new JwtStrategy();

    expect(
      strategy.validate({
        sub: 'user-1',
        email: 'organizer@example.com',
        role: 'ORGANIZER',
      }),
    ).toEqual({
      userId: 'user-1',
      email: 'organizer@example.com',
      role: 'ORGANIZER',
    });
  });

  it('defaults old role-less tokens to customer role', () => {
    const strategy = new JwtStrategy();

    expect(
      strategy.validate({
        sub: 'user-1',
        email: 'customer@example.com',
      }),
    ).toEqual({
      userId: 'user-1',
      email: 'customer@example.com',
      role: 'USER',
    });
  });
});
