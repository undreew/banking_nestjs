import { Role } from '../generated/prisma/enums.js';
import { API_PATHS } from '../constants/api-paths.js';
import { Roles } from '../decorators/role.decorator.js';
import { TransactionsService } from './transactions.service.js';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto.js';

@Controller(API_PATHS.TRANSACTION.ROOT)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Roles([Role.USER])
  getAllTransactions() {
    return this.transactionsService.getAllTransactions();
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
