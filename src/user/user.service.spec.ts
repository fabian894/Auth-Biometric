import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  // Setup the testing module before each test
  beforeEach(async () => {
    // Mock the Prisma user methods
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    // Create a testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'), // Mocked JWT return
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // --------------------
  // register()
  // --------------------
  describe('register', () => {
    it('should throw if email already exists', async () => {
      // Simulate existing user
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });

      // Expect an error when trying to register again
      await expect(service.register('test@example.com', 'password')).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should create a user if email is not taken', async () => {
      // Simulate no user found
      prisma.user.findUnique.mockResolvedValue(null);

      // Simulate Prisma create response
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      // Call register
      const result = await service.register('test@example.com', 'password');

      // Ensure the correct methods were called
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe('test@example.com');
    });
  });

  // --------------------
  // validateUser()
  // --------------------
  describe('validateUser', () => {
    it('should return a token for valid credentials', async () => {
      // Hash a valid password
      const hashedPassword = await bcrypt.hash('password', 10);

      // Simulate user found with hashed password
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      });

      // Call validateUser with correct password
      const result = await service.validateUser('test@example.com', 'password');
      expect(result.token).toBe('mocked-jwt-token');
    });

    it('should throw for invalid credentials (user not found)', async () => {
      // Simulate no user found
      prisma.user.findUnique.mockResolvedValue(null);

      // Expect exception
      await expect(service.validateUser('wrong@example.com', 'password')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw for incorrect password', async () => {
      // Hash a different password than the one tested
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Simulate user with hashed password
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      });

      // Try validating with the wrong password
      await expect(service.validateUser('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
