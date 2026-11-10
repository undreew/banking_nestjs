import { AUDIT_ACTIONS } from '../constants/audit.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DepositDto } from '../accounts/dto/deposit.dto.js';
import { TransferDto } from '../accounts/dto/transfer.dto.js';
import { WithdrawDto } from '../accounts/dto/withdraw.dto.js';
import { Transaction } from './entities/transaction.entity.js';
import { Account } from '../accounts/entities/account.entity.js';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto.js';
import { Decimal } from '../generated/prisma/internal/prismaNamespace.js';
import {
  AccountStatus,
  TransactionStatus,
  TransactionType,
} from '../generated/prisma/enums.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

interface CreateTransaction {
  description?: string;
  type: TransactionType;
  amount: number | Decimal;
  sourceAccountId?: string;
  destinationAccountId?: string;
  reversalOfTransactionId?: string;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly db: PrismaService) {}

  async getAllTransactions() {
    return 'Fetching all transactions...';
  }

  async reverseTransaction(
    transactionId: string,
    payload: ReverseTransactionDto,
  ) {
    const { reason } = payload;

    const transaction = await this.db.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.REVERSED) {
      throw new BadRequestException('Invalid transaction status');
    }

    if (transaction.type !== TransactionType.TRANSFER) {
      throw new ConflictException('Only transfers can be reversed');
    }

    const sourceAccount = await this.db.account.findUniqueOrThrow({
      where: { id: transaction.sourceAccountId! },
    });

    const destinationAccount = await this.db.account.findUniqueOrThrow({
      where: { id: transaction.destinationAccountId! },
    });

    if (destinationAccount.balance.comparedTo(transaction.amount) < 0) {
      throw new ConflictException('Insufficient destination account balance');
    }

    await this.db.account.update({
      where: { id: sourceAccount.id },
      data: {
        balance: sourceAccount.balance.add(transaction.amount),
      },
    });

    await this.db.account.update({
      where: { id: destinationAccount.id },
      data: {
        balance: destinationAccount.balance.minus(transaction.amount),
      },
    });

    const updatedOldTransaction = await this.db.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.REVERSED,
      },
    });

    const newTransaction = await this.createTransaction({
      description: reason,
      amount: transaction.amount,
      type: TransactionType.TRANSFER,
      reversalOfTransactionId: transaction.id,
      sourceAccountId: transaction.sourceAccountId!,
      destinationAccountId: transaction.destinationAccountId!,
    });

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_REVERSE, {
      id: newTransaction.id,
    });

    return {
      oldTransaction: new Transaction(updatedOldTransaction),
      newTransaction: new Transaction(newTransaction),
    };
  }

  async deposit(userId: string, payload: DepositDto) {
    const { accountNumber, amount, description } = payload;

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

    const transaction = await this.createTransaction({
      amount,
      description,
      type: TransactionType.DEPOSIT,
      destinationAccountId: account.id,
    });

    return {
      account: new Account(updatedAccount),
      transaction: new Transaction(transaction),
    };
  }

  async withdraw(userId: string, payload: WithdrawDto) {
    const { accountNumber, amount, description } = payload;

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

    const transaction = await this.createTransaction({
      amount,
      description,
      sourceAccountId: account.id,
      type: TransactionType.WITHDRAWAL,
    });

    return {
      account: new Account(updatedAccount),
      transaction: new Transaction(transaction),
    };
  }

  async transfer(userId: string, payload: TransferDto) {
    const {
      sourceAccountNumber,
      destinationAccountNumber,
      amount,
      description,
    } = payload;

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

    const transaction = await this.createTransaction({
      amount,
      description,
      type: TransactionType.TRANSFER,
      sourceAccountId: sourceAccount.id,
      destinationAccountId: destinationAccount.id,
    });

    return {
      account: new Account(sourceAccountUpdated),
      transaction: new Transaction(transaction),
    };
  }

  private async createTransaction(payload: CreateTransaction) {
    return await this.db.transaction.create({ data: payload });
  }

  private async checkOwnership(userId: string, accountUserId: string) {
    if (accountUserId !== userId) {
      throw new UnauthorizedException(`You don't own this account`);
    }
  }
}
