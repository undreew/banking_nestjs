import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { UsersModule } from './users/users.module.js';
import { PrismaModule } from "./prisma/prisma.module.js";
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerMiddleware } from "./middlewares/logger.middleware.js";
import { GlobalExceptionFilter } from "./filters/global-exceptions.filter.js";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    UsersModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor},
    {provide: APP_FILTER, useClass: GlobalExceptionFilter,},
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
