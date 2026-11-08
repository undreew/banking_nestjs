import { IsString, MinLength } from "class-validator";

export class UpdateUserDetailsDto {
  @IsString({message: "First name must be a string"})
  @MinLength(3, {message: "First name must be longer than 3 characters"})
  firstName: string;

  @IsString({message: "Last name must be a string"})
  @MinLength(6, {message: "Last name must be longer than 6 characters"})
  lastName: string;
}