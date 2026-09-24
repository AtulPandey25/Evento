import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('ApiGateway AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService);
  });

  it('forwards customer registration body to the auth service', () => {
    const dto = {
      email: 'customer@example.com',
      password: 'secret123',
      name: 'Customer One',
    };

    controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('forwards organizer registration body with selected role', () => {
    const dto = {
      email: 'organizer@example.com',
      password: 'secret123',
      name: 'Organizer One',
      role: 'ORGANIZER' as const,
    };

    controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });
});
