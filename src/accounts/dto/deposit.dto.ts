import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}
