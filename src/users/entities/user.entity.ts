import { Exclude } from 'class-transformer';
import { Role } from '../../generated/prisma/enums.js';

export class User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  firstName: string;
  lastName: string;
  role: Role;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
