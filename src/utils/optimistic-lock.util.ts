import { ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export class OptimisticLockError extends Error {}

function isRetryable(error: unknown): boolean {
  return (
    error instanceof OptimisticLockError ||
    (error instanceof PrismaClientKnownRequestError && error.code === 'P2034')
  );
}

export async function withOptimisticRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!isRetryable(error)) {
        throw error;
      }
    }
  }

  throw new ConflictException(
    'Could not complete the operation due to a concurrent update, please retry',
  );
}
