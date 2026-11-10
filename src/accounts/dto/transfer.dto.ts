import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TransferDto {
  @IsString()
  @IsNotEmpty()
  sourceAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  destinationAccountNumber: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
