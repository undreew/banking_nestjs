import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { EncoderService } from './encoder.service.js';
import { TokenModule } from '../token/token.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CookiesModule } from '../cookies/cookies.module.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EncoderService],
  imports: [PrismaModule, TokenModule, CookiesModule],
})
export class AuthModule {}
