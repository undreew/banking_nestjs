import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity.js';
import { AUDIT_ACTIONS } from "../constants/audit.js";
import { CreateUserDto } from './dto/create-user.dto.js';
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateUserRoleDto } from "./dto/update-user-role.dto.js";
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto.js";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prismaService: PrismaService) {
  }

  async getUsers(): Promise<User[]> {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => new User(user));
  }

  async getOneUser(id: string) {
    const user = await this.prismaService.user.findFirstOrThrow({where: {id}});
    if (!user) throw new NotFoundException("User not found");
    return new User(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = await this.prismaService.user.create({data: createUserDto});
    this.logger.log(AUDIT_ACTIONS.USER_CREATE, {id: createdUser.id});
    return new User(createdUser);
  }

  async updateRole(id: string, payload: UpdateUserRoleDto) {
    const user = await this.prismaService.user.update({
      where: {id},
      data: payload
    });
    this.logger.log(AUDIT_ACTIONS.USER_UPDATE.ROLE, {id: user.id});
    return new User(user);
  }

  async updateStatus(id: string, payload: UpdateUserStatusDto) {
    const user = await this.prismaService.user.update({
      where: {id},
      data: payload
    });
    this.logger.log(AUDIT_ACTIONS.USER_UPDATE.STATUS, {id: user.id});
    return new User(user);
  }

  async updateUserProfile(id: string, payload: UpdateUserDetailsDto) {
    const user = await this.prismaService.user.update({
      where: {id},
      data: payload
    });
    this.logger.log(AUDIT_ACTIONS.USER_UPDATE.DETAILS, {id: user.id});
    return new User(user);
  }

  async deleteUser(id: string) {
    await this.prismaService.user.delete({
      where: {id},
    });
  }
}
