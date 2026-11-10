import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';

const ACCOUNT_NUMBER_LENGTH = 15;

@Injectable()
export class AccountNumberGeneratorService {
  generateAccountNumber(): string {
    let accountNumber = String(randomInt(1, 10));

    for (let i = 1; i < ACCOUNT_NUMBER_LENGTH - 1; i++) {
      accountNumber += randomInt(10);
    }

    const checkDigit = this.calculateCheckDigit(accountNumber);
    accountNumber += checkDigit;

    return accountNumber;
  }

  private calculateCheckDigit(digits: string): number {
    let sum = 0;
    let doubleDigit = true;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number(digits[i]);

      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      doubleDigit = !doubleDigit;
    }

    return (10 - (sum % 10)) % 10;
  }
}
