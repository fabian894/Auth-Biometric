import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,      // Inject Prisma service for DB access
    private jwtService: JwtService,     // Inject JWT service to generate tokens
  ) {}

  /**
   * Validate user credentials
   * @param email - User's email
   * @param password - Plain-text password
   * @returns User object if valid, otherwise throws UnauthorizedException
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Perform login and return JWT token
   * @param email - User's email
   * @param password - User's password
   * @returns Object containing signed JWT token
   */
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password); // Validate credentials
    const payload = { sub: user.id, email: user.email };   // Payload for JWT

    return {
      access_token: await this.jwtService.signAsync(payload), // Return signed token
    };
  }

  /**
   * Biometric login using biometric key
   * @param biometricKey - Unique biometric identifier
   * @returns Object containing signed JWT token
   */
  async biometricLogin(biometricKey: string) {
    const user = await this.prisma.user.findUnique({ where: { biometricKey } });

    // If user not found with the biometric key, throw error
    if (!user) {
      throw new UnauthorizedException('Invalid biometric key');
    }

    const payload = { sub: user.id, email: user.email };   // Payload for JWT

    return {
      access_token: await this.jwtService.signAsync(payload), // Return signed token
    };
  }
}
