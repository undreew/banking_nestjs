import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
