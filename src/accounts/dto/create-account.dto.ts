import { IsEnum } from 'class-validator';
import { AccountType } from '../../generated/prisma/enums.js';

export class CreateAccountDto {
  @IsEnum(AccountType, {
    message: ({ constraints }) =>
      `Account type must either be one of these values: ${constraints[constraints.length - 1]}`,
  })
  type: AccountType;
}
