/* eslint-disable prettier/prettier */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { PrismaService } from '../prisma/prisma.service';
import { UserResolver } from './user/user.resolver';
import { UserService } from './user/user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    AuthModule,
    PrismaModule,
    UserModule,
    JwtModule.register({
      secret: 'your_jwt_secret_here', 
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  providers: [AppResolver, UserResolver, UserService, PrismaService],
})
export class AppModule {}
