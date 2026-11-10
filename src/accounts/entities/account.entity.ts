import { Exclude } from 'class-transformer';
import { AccountStatus, AccountType } from '../../generated/prisma/enums.js';
import type { Decimal } from '../../generated/prisma/internal/prismaNamespace.js';

export class Account {
  @Exclude()
  id: string;

  @Exclude()
  userId: string;

  @Exclude()
  version: number;

  type: AccountType;
  balance: string;
  status: AccountStatus;
  accountNumber: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(
    partial: Omit<Partial<Account>, 'version' | 'balance'> & {
      version?: bigint | number;
      balance?: Decimal | string;
    },
  ) {
    Object.assign(this, partial);
    this.version = Number(partial.version ?? 0);
    this.balance = partial.balance?.toString() ?? '0.0000';
  }
}
