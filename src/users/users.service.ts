import { User } from './entities/user.entity.js';
import { Injectable, Logger } from '@nestjs/common';
import { AUDIT_ACTIONS } from "../constants/audit.js";
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = await this.prismaService.user.create({data: createUserDto});

    this.logger.log(AUDIT_ACTIONS.USER_CREATE, {
      id: createdUser.id,
      lastName: createdUser.lastName,
      firstName: createdUser.firstName,
    });

    return new User(createdUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => new User(user));
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
