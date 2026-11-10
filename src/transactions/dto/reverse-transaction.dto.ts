import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReverseTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500, { message: 'The maximum length of characters is 500' })
  reason: string;
}