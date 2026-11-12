import { Injectable, Logger } from '@nestjs/common';
import { AUDIT_ACTIONS } from '../constants/audit.js';
import { Account } from './entities/account.entity.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { GetAccountsQueryDto } from './dto/get-accounts-query.dto.js';
import type * as Prisma from '../generated/prisma/internal/prismaNamespace.js';
import { TransactionsService } from '../transactions/transactions.service.js';
import { AccountNumberGeneratorService } from './account-number-generator.service.js';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly accountNumGenerator: AccountNumberGeneratorService,
  ) {}

  async getUserAccounts(id: string) {
    const accounts = await this.db.account.findMany({
      where: { userId: id },
    });
    return accounts.map((account) => new Account(account));
  }

  async getAllAccounts(query: GetAccountsQueryDto) {
    const {
      userId,
      accountNumber,
      type,
      status,
      minBalance,
      maxBalance,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    const where: Prisma.AccountWhereInput = {
      ...(userId && { userId }),
      ...(accountNumber && { accountNumber }),
      ...(type && { type }),
      ...(status && { status }),
      ...((minBalance !== undefined || maxBalance !== undefined) && {
        balance: {
          ...(minBalance !== undefined && { gte: minBalance }),
          ...(maxBalance !== undefined && { lte: maxBalance }),
        },
      }),
    };

    const [accounts, total] = await Promise.all([
      this.db.account.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.account.count({ where }),
    ]);

    return {
      data: accounts.map((account) => new Account(account)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createAccount(id: string, payload: CreateAccountDto) {
    const accountNumber = this.accountNumGenerator.generateAccountNumber();
    const account = await this.db.account.create({
      data: {
        accountNumber,
        type: payload.type,
        userId: id,
      },
    });
    this.logger.log(AUDIT_ACTIONS.ACCOUNT_CREATE, { id: account.id });
    return new Account(account);
  }
}
