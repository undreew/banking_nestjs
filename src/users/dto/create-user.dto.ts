import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @MinLength(3, {message: "First name must be longer that 3 characters"})
  firstName: string;

  @IsString()
  @MinLength(6, {message: "Last name must be longer that 6 characters"})
  lastName: string;

  @IsEmail({}, {message: "Email must be a valid email"})
  email: string;

  @MinLength(6, {message: "Password must be at least 6 characters"})
  @Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/, {
    message: 'Field must contain both letters and numbers, with no special characters',
  })
  password: string;

  @IsString()
  @IsNotEmpty({message: "Role must not be empty"})
  role: string;
}
