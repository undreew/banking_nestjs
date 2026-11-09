import { Role } from '../../generated/prisma/enums.js';
import { IsEmail, IsEnum, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'First name must be a string' })
  @MinLength(3, { message: 'First name must be longer than 3 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be longer than 2 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Email must be a valid email' })
  email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, {
    message:
      'Password must contain both letters and numbers, with no special characters',
  })
  password: string;

  @IsEnum(Role, {
    message: ({ constraints }) =>
      `Role must either be one of these values: ${constraints[constraints.length - 1]}`,
  })
  role: Role;
}
