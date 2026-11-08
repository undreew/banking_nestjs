import { IsEmail, IsEnum, IsString, Matches, MinLength } from "class-validator";
import ROLE_ENUM from "../../enums/role.js";

export class CreateUserDto {
  @IsString({message: "First name must be a string"})
  @MinLength(3, {message: "First name must be longer than 3 characters"})
  firstName: string;

  @IsString({message: "Last name must be a string"})
  @MinLength(6, {message: "Last name must be longer than 6 characters"})
  lastName: string;

  @IsEmail({}, {message: "Email must be a valid email"})
  email: string;

  @MinLength(2, {message: "Password must be at least 2 characters"})
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, {
    message: 'Field must contain both letters and numbers, with no special characters',
  })
  password: string;

  @IsString({message: "Role must be a string"})
  @IsEnum(ROLE_ENUM, {
    message: ({constraints}) => `Role must either be one of these values: ${constraints[constraints.length - 1]}`
  })
  role: string;
}
