import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
