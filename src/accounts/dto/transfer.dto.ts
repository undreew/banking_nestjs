import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  sourceAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  destinationAccountNumber: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}
