import type { Account } from '../generated/prisma/client.js';
import { OptimisticLockError } from './optimistic-lock.util.js';
import type * as Prisma from '../generated/prisma/internal/prismaNamespace.js';
import type { TransactionClient } from '../generated/prisma/internal/prismaNamespace.js';

interface AccountLegUpdate {
  account: Account;
  data: Prisma.AccountUpdateManyMutationInput;
  label: string;
}

export async function updateAccountLegsInOrder(
  tx: TransactionClient,
  legs: [AccountLegUpdate, AccountLegUpdate],
): Promise<[Account, Account]> {
  const orderedLegs = [...legs].sort((a, b) =>
    a.account.id < b.account.id ? -1 : a.account.id > b.account.id ? 1 : 0,
  );

  for (const leg of orderedLegs) {
    const { count } = await tx.account.updateMany({
      where: { id: leg.account.id, version: leg.account.version },
      data: leg.data,
    });

    if (count === 0) {
      throw new OptimisticLockError(
        `${leg.label} account version changed concurrently`,
      );
    }
  }

  const first = await tx.account.findUniqueOrThrow({
    where: { id: legs[0].account.id },
  });
  const second = await tx.account.findUniqueOrThrow({
    where: { id: legs[1].account.id },
  });

  return [first, second];
}
