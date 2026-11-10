import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  async getAllTransactions() {
    return 'Fetching all transactions...';
  }

  async reverseTransaction() {
    return 'Reversing transaction...';
  }

  async deposit() {
    return 'Depositing...';
  }

  async withdraw() {
    return 'Withdraw...';
  }

  async transfer() {
    return 'Transfer...';
  }
}
