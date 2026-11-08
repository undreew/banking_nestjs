import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  firstName: string;
  lastName: string;
  role: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
