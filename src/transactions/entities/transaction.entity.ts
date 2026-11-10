import { Exclude } from 'class-transformer';
import type { Decimal } from '../../generated/prisma/internal/prismaNamespace.js';
import {
  TransactionStatus,
  TransactionType,
} from '../../generated/prisma/enums.js';

export class Transaction {
  @Exclude()
  idempotencyKey: string | null;

  id: string;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  type: TransactionType;
  amount: string;
  status: TransactionStatus;
  reversalOfTransactionId: string | null;
  description: string | null;
  createdAt: Date;

  constructor(
    partial: Omit<Partial<Transaction>, 'amount'> & {
      amount: Decimal | string;
    },
  ) {
    Object.assign(this, partial);
    this.amount = partial.amount.toString();
  }
}
