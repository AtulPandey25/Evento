import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceService } from './auth-service.service';
import { JwtService } from '@nestjs/jwt';
import { KAFKA_SERVICE } from '@app/kafka';
import { DatabaseService } from '@app/database';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthServiceService', () => {
  let service: AuthServiceService;

  // create mock objects

  const mockKafkaClient = {
    emit: jest.fn(),
    connect: jest.fn(),
  };

  const mockDbService = {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnValue([]),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceService,
        { provide: KAFKA_SERVICE, useValue: mockKafkaClient },
        { provide: DatabaseService, useValue: mockDbService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthServiceService>(AuthServiceService);

    // Clear mock call history before each test
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('identifies the auth service without scaffold text', () => {
      const result = service.getHello();
      expect(result).toBe('Evento Auth Service');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock no existing user
      mockDbService.db.limit.mockReturnValueOnce([]);

      const mockUser = {
        id: 'user-id-123',
        email: 'fiston@withcodewise.com',
        name: 'Fiston',
        role: 'ORGANIZER',
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
        updatedAt: new Date('2026-06-30T10:00:00.000Z'),
      };
      mockDbService.db.returning.mockReturnValueOnce([mockUser]);

      const result = await service.register(
        'fiston@withcodewise.com',
        'securePassword',
        'Fiston',
        'ORGANIZER',
      );

      expect(result).toEqual({
        message: 'User registered successfully',
        user: {
          id: 'user-id-123',
          email: 'fiston@withcodewise.com',
          name: 'Fiston',
          role: 'ORGANIZER',
          createdAt: new Date('2026-06-30T10:00:00.000Z'),
          updatedAt: new Date('2026-06-30T10:00:00.000Z'),
        },
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('securePassword', 10);
      expect(mockDbService.db.values).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'ORGANIZER' }),
      );

      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: 'user-id-123',
          email: 'fiston@withcodewise.com',
          name: 'Fiston',
          role: 'ORGANIZER',
        }),
      );
    });

    it('defaults registration to customer role when no role is provided', async () => {
      mockDbService.db.limit.mockReturnValueOnce([]);

      const mockUser = {
        id: 'customer-id-123',
        email: 'customer@example.com',
        name: 'Customer One',
        role: 'USER',
        createdAt: new Date('2026-06-30T10:00:00.000Z'),
        updatedAt: new Date('2026-06-30T10:00:00.000Z'),
      };
      mockDbService.db.returning.mockReturnValueOnce([mockUser]);

      const result = await service.register(
        'customer@example.com',
        'securePassword',
        'Customer One',
      );

      expect(result).toEqual({
        message: 'User registered successfully',
        user: mockUser,
      });
      expect(mockDbService.db.values).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'USER' }),
      );
      expect(mockKafkaClient.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: 'customer-id-123',
          email: 'customer@example.com',
          name: 'Customer One',
          role: 'USER',
        }),
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      mockDbService.db.limit.mockReturnValueOnce([
        { id: 'existing-user-id', email: 'fiston@withcodewise.com' },
      ]);

      await expect(
        service.register('fiston@withcodewise.com', 'securePassword', 'Fiston'),
      ).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('signs JWTs with user role so the gateway can enforce customer and organizer paths', async () => {
      const mockUser = {
        id: 'user-id-123',
        email: 'organizer@example.com',
        password: 'hashed-password',
        name: 'Organizer',
        role: 'ORGANIZER',
      };
      mockDbService.db.limit.mockReturnValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login('organizer@example.com', 'securePassword');

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id-123',
        email: 'organizer@example.com',
        role: 'ORGANIZER',
      });
      expect(result).toMatchObject({
        access_token: 'mocked-jwt-token',
        user: {
          id: 'user-id-123',
          email: 'organizer@example.com',
          role: 'ORGANIZER',
        },
      });
    });
  });
});
