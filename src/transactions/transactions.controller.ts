import { Role } from '../generated/prisma/enums.js';
import { API_PATHS } from '../constants/api-paths.js';
import { Roles } from '../decorators/role.decorator.js';
import type { TokenClaim } from '../token/token.service.js';
import { TransactionsService } from './transactions.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto.js';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto.js';

@Controller(API_PATHS.TRANSACTION.ROOT)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Roles([Role.USER])
  getAllTransactions(
    @Query() query: GetTransactionsQueryDto,
    @CurrentUser() actor: TokenClaim,
  ) {
    return this.transactionsService.getAllTransactions(actor.sub, query);
  }

  @Post(':id/reverse')
  @Roles([Role.ADMIN])
  reverseTransaction(
    @Param('id') id: string,
    @Body() payload: ReverseTransactionDto,
  ) {
    return this.transactionsService.reverseTransaction(id, payload);
  }
}
