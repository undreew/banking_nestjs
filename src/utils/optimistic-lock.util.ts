import { ConflictException } from '@nestjs/common';

export class OptimisticLockError extends Error {}

export async function withOptimisticRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!(error instanceof OptimisticLockError)) {
        throw error;
      }
    }
  }

  throw new ConflictException(
    'Could not complete the operation due to a concurrent update, please retry',
  );
}
