import { IsBoolean } from "class-validator";

export class UpdateUserStatusDto {
  @IsBoolean({message: "Enabled must be a boolean"})
  enabled: boolean;
}
