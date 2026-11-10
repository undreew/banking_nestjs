import { AUDIT_ACTIONS } from '../constants/audit.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DepositDto } from '../accounts/dto/deposit.dto.js';
import { AccountStatus } from '../generated/prisma/enums.js';
import { TransferDto } from '../accounts/dto/transfer.dto.js';
import { WithdrawDto } from '../accounts/dto/withdraw.dto.js';
import { Account } from '../accounts/entities/account.entity.js';
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly db: PrismaService) {}

  async getAllTransactions() {
    return 'Fetching all transactions...';
  }

  async reverseTransaction() {
    return 'Reversing transaction...';
  }

  async deposit(userId: string, payload: DepositDto) {
    const { accountNumber, amount } = payload;

    const account = await this.db.account.findUniqueOrThrow({
      where: { accountNumber },
    });

    await this.checkOwnership(userId, account.userId);

    if (account.status !== AccountStatus.ACTIVE) {
      throw new ConflictException('Account is not active');
    }

    const updatedAccount = await this.db.account.update({
      where: {
        accountNumber,
      },
      data: {
        balance: account.balance.add(amount),
      },
    });

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_DEPOSIT, {
      id: updatedAccount.id,
    });

    return new Account(updatedAccount);
  }

  async withdraw(userId: string, payload: WithdrawDto) {
    const { accountNumber, amount } = payload;

    const account = await this.db.account.findUniqueOrThrow({
      where: { accountNumber },
    });

    await this.checkOwnership(userId, account.userId);

    if (account.status !== AccountStatus.ACTIVE) {
      throw new ConflictException('Account is not active');
    }

    if (account.balance.comparedTo(amount) < 0) {
      throw new ConflictException('Insufficient balance');
    }

    const updatedAccount = await this.db.account.update({
      where: { accountNumber },
      data: {
        balance: account.balance.minus(amount),
      },
    });

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_WITHDRAW, {
      id: updatedAccount.id,
    });

    return new Account(updatedAccount);
  }

  async transfer(userId: string, payload: TransferDto) {
    const { sourceAccountNumber, destinationAccountNumber, amount } = payload;

    if (sourceAccountNumber === destinationAccountNumber) {
      throw new ConflictException(`Can't transfer to the same account`);
    }

    const sourceAccount = await this.db.account.findUniqueOrThrow({
      where: { accountNumber: sourceAccountNumber },
    });

    const destinationAccount = await this.db.account.findUniqueOrThrow({
      where: { accountNumber: destinationAccountNumber },
    });

    await this.checkOwnership(userId, sourceAccount.userId);

    if (
      sourceAccount.status !== AccountStatus.ACTIVE ||
      destinationAccount.status !== AccountStatus.ACTIVE
    ) {
      throw new ConflictException(`Account is not active`);
    }

    if (sourceAccount.balance.comparedTo(amount) < 0) {
      throw new ConflictException('Insufficient balance');
    }

    const sourceAccountUpdated = await this.db.account.update({
      where: { accountNumber: sourceAccountNumber },
      data: { balance: sourceAccount.balance.minus(amount) },
    });

    const destinationAccountUpdated = await this.db.account.update({
      where: { accountNumber: destinationAccountNumber },
      data: { balance: destinationAccount.balance.plus(amount) },
    });

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_TRANSFER, {
      amount,
      sourceAccount: sourceAccountUpdated.id,
      destinationAccount: destinationAccountUpdated.id,
    });

    return new Account(sourceAccountUpdated);
  }

  private async checkOwnership(userId: string, accountUserId: string) {
    if (accountUserId !== userId) {
      throw new UnauthorizedException(`You don't own this account`);
    }
  }
}
