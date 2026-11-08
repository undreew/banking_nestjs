import { IsEnum, IsString } from "class-validator";
import ROLE_ENUM from "../../enums/role.js";

export class UpdateUserRoleDto {
  @IsString({message: "Role must be a string"})
  @IsEnum(ROLE_ENUM, {
    message: ({constraints}) => `Role must either be one of these values: ${constraints[constraints.length - 1]}`
  })
  role: string;
}