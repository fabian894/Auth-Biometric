/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user with email and password
   * - Checks if the email already exists
   * - Hashes the password before saving
   */
  async register(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }

  /**
   * Validates a user by email and password
   * - Throws if user doesn't exist or password is incorrect
   * - Returns a signed JWT token if successful
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    // Generate and return JWT token
    const token = await this.jwtService.signAsync({ userId: user.id, email: user.email });
    return { token };
  }

  /**
   * Find a user by their ID
   */
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
