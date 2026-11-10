import { DepositDto } from './dto/deposit.dto.js';
import { TransferDto } from './dto/transfer.dto.js';
import { WithdrawDto } from './dto/withdraw.dto.js';
import { Role } from '../generated/prisma/enums.js';
import { API_PATHS } from '../constants/api-paths.js';
import { AccountsService } from './accounts.service.js';
import { Roles } from '../decorators/role.decorator.js';
import type { TokenClaim } from '../token/token.service.js';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { TransactionsService } from '../transactions/transactions.service.js';

@Controller(API_PATHS.ACCOUNT.ROOT)
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly transactionService: TransactionsService,
  ) {}

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
  deposit(@Body() payload: DepositDto, @CurrentUser() actor: TokenClaim) {
    return this.transactionService.deposit(actor.sub, payload);
  }

  @Post('withdraw')
  @Roles([Role.USER])
  withdraw(@Body() payload: WithdrawDto, @CurrentUser() actor: TokenClaim) {
    return this.transactionService.withdraw(actor.sub, payload);
  }

  @Post('transfer')
  @Roles([Role.USER])
  transfer(@Body() payload: TransferDto, @CurrentUser() actor: TokenClaim) {
    return this.transactionService.transfer(actor.sub, payload);
  }
}
