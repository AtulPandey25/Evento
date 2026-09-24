import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AuthService } from './auth.service';

describe('ApiGateway AuthService', () => {
  const originalAuthUrl = process.env.AUTH_SERVICE_URL;

  afterEach(() => {
    process.env.AUTH_SERVICE_URL = originalAuthUrl;
    jest.restoreAllMocks();
  });

  it('forwards selected role when registering a user', async () => {
    process.env.AUTH_SERVICE_URL = 'http://auth.local';
    const response = {
      message: 'User registered successfully',
      user: {
        id: 'organizer-1',
        email: 'organizer@example.com',
        name: 'Organizer',
        role: 'ORGANIZER',
        createdAt: '2026-06-30T10:00:00.000Z',
        updatedAt: '2026-06-30T10:00:00.000Z',
      },
    };
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: response })),
    } as unknown as HttpService;
    const service = new AuthService(httpService);

    await service.register({
      email: 'organizer@example.com',
      password: 'secret123',
      name: 'Organizer',
      role: 'ORGANIZER',
    });

    expect(httpService.post).toHaveBeenCalledWith('http://auth.local/register', {
      email: 'organizer@example.com',
      password: 'secret123',
      name: 'Organizer',
      role: 'ORGANIZER',
    });
  });

  it('forwards customer registration without adding an organizer role', async () => {
    process.env.AUTH_SERVICE_URL = 'http://auth.local';
    const response = {
      message: 'User registered successfully',
      user: {
        id: 'customer-1',
        email: 'customer@example.com',
        name: 'Customer',
        role: 'USER',
        createdAt: '2026-06-30T10:00:00.000Z',
        updatedAt: '2026-06-30T10:00:00.000Z',
      },
    };
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: response })),
    } as unknown as HttpService;
    const service = new AuthService(httpService);

    await service.register({
      email: 'customer@example.com',
      password: 'secret123',
      name: 'Customer',
    });

    expect(httpService.post).toHaveBeenCalledWith('http://auth.local/register', {
      email: 'customer@example.com',
      password: 'secret123',
      name: 'Customer',
    });
  });
});
