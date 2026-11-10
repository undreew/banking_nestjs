import { AccountStatus } from '../generated/prisma/enums.js';
import type { Account } from '../generated/prisma/client.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { Decimal } from '../generated/prisma/internal/prismaNamespace.js';

export function assertAccountActive(account: Account): void {
  if (account.status !== AccountStatus.ACTIVE) {
    throw new ConflictException('Account is not active');
  }
}

export function assertOwnedBy(account: Account, userId: string): void {
  if (account.userId !== userId) {
    throw new UnauthorizedException(`You don't own this account`);
  }
}

export function assertSufficientBalance(
  account: Account,
  amount: number | Decimal,
  message = 'Insufficient balance',
): void {
  if (account.balance.comparedTo(amount) < 0) {
    throw new ConflictException(message);
  }
}
