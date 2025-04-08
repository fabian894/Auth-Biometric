import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  /**
   * GraphQL mutation for user login
   * @param email - User's email
   * @param password - User's password
   * @returns AuthResponse object containing JWT token
   */
  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  /**
   * GraphQL mutation for biometric login
   * @param biometricKey - User's unique biometric key
   * @returns AuthResponse object containing JWT token
   */
  @Mutation(() => AuthResponse)
  async biometricLogin(
    @Args('biometricKey') biometricKey: string,
  ) {
    return this.authService.biometricLogin(biometricKey);
  }
}
