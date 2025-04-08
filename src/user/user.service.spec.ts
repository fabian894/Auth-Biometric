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

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should throw if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(service.register('test@example.com', 'password')).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should create a user if email is not taken', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      const result = await service.register('test@example.com', 'password');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('validateUser', () => {
    it('should return a token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      });

      const result = await service.validateUser('test@example.com', 'password');
      expect(result.token).toBe('mocked-jwt-token');
    });

    it('should throw for invalid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.validateUser('wrong@example.com', 'password')).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw for incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      });

      await expect(service.validateUser('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
