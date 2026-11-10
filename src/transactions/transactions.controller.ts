import { Role } from '../generated/prisma/enums.js';
import { Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../decorators/role.decorator.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @Roles([Role.USER])
  getAllTransactions() {
    return this.transactionsService.getAllTransactions();
  }

  @Post()
  @Roles([Role.USER])
  reverseTransaction() {
    return this.transactionsService.reverseTransaction();
  }
}
