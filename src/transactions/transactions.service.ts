import { AUDIT_ACTIONS } from '../constants/audit.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DepositDto } from '../accounts/dto/deposit.dto.js';
import { TransferDto } from '../accounts/dto/transfer.dto.js';
import { WithdrawDto } from '../accounts/dto/withdraw.dto.js';
import { Transaction } from './entities/transaction.entity.js';
import { Account } from '../accounts/entities/account.entity.js';
import { ReverseTransactionDto } from './dto/reverse-transaction.dto.js';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto.js';
import type * as Prisma from '../generated/prisma/internal/prismaNamespace.js';
import {
  TransactionStatus,
  TransactionType,
} from '../generated/prisma/enums.js';
import {
  Decimal,
  type TransactionClient,
} from '../generated/prisma/internal/prismaNamespace.js';
import {
  assertAccountActive,
  assertOwnedBy,
  assertSufficientBalance,
} from '../accounts/account.rules.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
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

  async getAllTransactions(userId: string, query: GetTransactionsQueryDto) {
    const {
      accountNumber,
      type,
      status,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
      page,
      limit,
    } = query;

    const ownershipFilter = accountNumber
      ? await this.resolveOwnedAccountFilter(userId, accountNumber)
      : {
          OR: [
            { sourceAccount: { userId } },
            { destinationAccount: { userId } },
          ],
        };

    const where: Prisma.TransactionWhereInput = {
      ...ownershipFilter,
      ...(type && { type }),
      ...(status && { status }),
      ...((fromDate || toDate) && {
        createdAt: {
          ...(fromDate && { gte: new Date(fromDate) }),
          ...(toDate && { lte: new Date(toDate) }),
        },
      }),
      ...((minAmount !== undefined || maxAmount !== undefined) && {
        amount: {
          ...(minAmount !== undefined && { gte: minAmount }),
          ...(maxAmount !== undefined && { lte: maxAmount }),
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      this.db.transaction.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.transaction.count({ where }),
    ]);

    return {
      data: transactions.map((transaction) => new Transaction(transaction)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async resolveOwnedAccountFilter(
    userId: string,
    accountNumber: string,
  ): Promise<Prisma.TransactionWhereInput> {
    const account = await this.db.account.findUnique({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    assertOwnedBy(account, userId);

    return {
      OR: [
        { sourceAccountId: account.id },
        { destinationAccountId: account.id },
      ],
    };
  }

  async reverseTransaction(
    transactionId: string,
    payload: ReverseTransactionDto,
  ) {
    const { reason } = payload;

    const transaction = await this.db.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

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

    assertAccountActive(sourceAccount);
    assertAccountActive(destinationAccount);
    assertSufficientBalance(
      destinationAccount,
      transaction.amount,
      'Insufficient destination account balance',
    );

    const { updatedOldTransaction, newTransaction } =
      await this.db.$transaction(async (tx) => {
        await tx.account.update({
          where: { id: sourceAccount.id },
          data: { balance: sourceAccount.balance.add(transaction.amount) },
        });

        await tx.account.update({
          where: { id: destinationAccount.id },
          data: {
            balance: destinationAccount.balance.minus(transaction.amount),
          },
        });

        const updatedOldTransaction = await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.REVERSED },
        });

        const newTransaction = await this.createTransaction(
          {
            description: reason,
            amount: transaction.amount,
            type: TransactionType.TRANSFER,
            reversalOfTransactionId: transaction.id,
            sourceAccountId: transaction.destinationAccountId!,
            destinationAccountId: transaction.sourceAccountId!,
          },
          tx,
        );

        return { updatedOldTransaction, newTransaction };
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

    assertOwnedBy(account, userId);
    assertAccountActive(account);

    const { updatedAccount, transaction } = await this.db.$transaction(
      async (tx) => {
        const updatedAccount = await tx.account.update({
          where: { accountNumber },
          data: { balance: account.balance.add(amount) },
        });

        const transaction = await this.createTransaction(
          {
            amount,
            description,
            type: TransactionType.DEPOSIT,
            destinationAccountId: account.id,
          },
          tx,
        );

        return { updatedAccount, transaction };
      },
    );

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_DEPOSIT, {
      id: updatedAccount.id,
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

    assertOwnedBy(account, userId);
    assertAccountActive(account);
    assertSufficientBalance(account, amount);

    const { updatedAccount, transaction } = await this.db.$transaction(
      async (tx) => {
        const updatedAccount = await tx.account.update({
          where: { accountNumber },
          data: { balance: account.balance.minus(amount) },
        });

        const transaction = await this.createTransaction(
          {
            amount,
            description,
            sourceAccountId: account.id,
            type: TransactionType.WITHDRAWAL,
          },
          tx,
        );

        return { updatedAccount, transaction };
      },
    );

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_WITHDRAW, {
      id: updatedAccount.id,
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

    assertOwnedBy(sourceAccount, userId);
    assertAccountActive(sourceAccount);
    assertAccountActive(destinationAccount);
    assertSufficientBalance(sourceAccount, amount);

    const { sourceAccountUpdated, destinationAccountUpdated, transaction } =
      await this.db.$transaction(async (tx) => {
        const sourceAccountUpdated = await tx.account.update({
          where: { accountNumber: sourceAccountNumber },
          data: { balance: sourceAccount.balance.minus(amount) },
        });

        const destinationAccountUpdated = await tx.account.update({
          where: { accountNumber: destinationAccountNumber },
          data: { balance: destinationAccount.balance.plus(amount) },
        });

        const transaction = await this.createTransaction(
          {
            amount,
            description,
            type: TransactionType.TRANSFER,
            sourceAccountId: sourceAccount.id,
            destinationAccountId: destinationAccount.id,
          },
          tx,
        );

        return { sourceAccountUpdated, destinationAccountUpdated, transaction };
      });

    this.logger.log(AUDIT_ACTIONS.TRANSACTION_TRANSFER, {
      amount,
      sourceAccount: sourceAccountUpdated.id,
      destinationAccount: destinationAccountUpdated.id,
    });

    return {
      account: new Account(sourceAccountUpdated),
      transaction: new Transaction(transaction),
    };
  }

  private async createTransaction(
    payload: CreateTransaction,
    tx: TransactionClient,
  ) {
    return await tx.transaction.create({ data: payload });
  }
}
