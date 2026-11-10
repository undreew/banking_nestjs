import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
