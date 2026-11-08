import { IsEnum } from "class-validator";
import { Role } from "../../generated/prisma/enums.js";

export class UpdateUserRoleDto {
  @IsEnum(Role, {
    message: ({constraints}) => `Role must either be one of these values: ${constraints[constraints.length - 1]}`
  })
  role: Role;
}