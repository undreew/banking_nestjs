import { Role } from '../generated/prisma/enums.js';
import { API_PATHS } from '../constants/api-paths.js';
import { AccountsService } from './accounts.service.js';
import { Roles } from '../decorators/role.decorator.js';
import type { TokenClaim } from '../token/token.service.js';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';

@Controller(API_PATHS.ACCOUNT.ROOT)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @Roles([Role.USER])
  getUserAccounts(@CurrentUser() actor: TokenClaim) {
    return this.accountsService.getUserAccounts(actor.sub);
  }

  @Post()
  @Roles([Role.USER])
  createAccount(
    @Body() payload: CreateAccountDto,
    @CurrentUser() actor: TokenClaim,
  ) {
    return this.accountsService.createAccount(actor.sub, payload);
  }

  @Post('deposit')
  @Roles([Role.USER])
  deposit() {
    return this.accountsService.deposit();
  }

  @Post('withdraw')
  @Roles([Role.USER])
  withdraw() {
    return this.accountsService.withdraw();
  }

  @Post('transfer')
  @Roles([Role.USER])
  transfer() {
    return this.accountsService.transfer();
  }
}
