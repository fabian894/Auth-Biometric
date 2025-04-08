/* eslint-disable prettier/prettier */
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model'; 
import { LoginInput } from './dto/login.input'; 
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard'; 
import { CurrentUser } from '../auth/current-user.decorator'; 

@Resolver(() => User) // The GraphQL resolver for the User model
export class UserResolver {
  constructor(private userService: UserService) {} 

  // Mutation to register a new user
  @Mutation(() => User) 
  async register(
    @Args('email') email: string, 
    @Args('password') password: string, 
  ) {
    return this.userService.register(email, password); 
  }

  // Mutation to login the user and return a JWT token
  @Mutation(() => String)
  async login(@Args('data') data: LoginInput): Promise<string> {
    // Validate the user credentials and generate a token
    const { token } = await this.userService.validateUser(data.email, data.password);
    return token; // Return the generated token
  }

  // Query to fetch the currently authenticated user
  @UseGuards(GqlAuthGuard) 
  @Query(() => User)
  async me(@CurrentUser() user: any) {
    // Using the @CurrentUser() decorator to access the user from the context (authenticated user)
    return this.userService.findById(user.userId); // Return the user data by ID
  }
}
