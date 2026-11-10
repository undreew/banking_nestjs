import { Injectable, Logger } from '@nestjs/common';
import { AUDIT_ACTIONS } from '../constants/audit.js';
import { Account } from './entities/account.entity.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
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
