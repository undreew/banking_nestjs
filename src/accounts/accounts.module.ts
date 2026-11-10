import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AccountsController } from './accounts.controller.js';
import { AccountNumberGeneratorService } from './account-number-generator.service.js';

@Module({
  controllers: [AccountsController],
  providers: [AccountsService, AccountNumberGeneratorService],
  imports: [PrismaModule],
})
export class AccountsModule {}
