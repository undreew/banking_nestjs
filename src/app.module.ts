import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { RoleGuard } from './guards/role-guard.js';
import { AppController } from './app.controller.js';
import { TokenModule } from './token/token.module.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CookiesModule } from './cookies/cookies.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module.js';
import { LoggerMiddleware } from './middlewares/logger.middleware.js';
import { GlobalExceptionFilter } from './filters/global-exceptions.filter.js';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow('ACCESS_TOKEN_TTL'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    TokenModule,
    CookiesModule,
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
