import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { API_PATHS } from "../constants/api-paths.js";
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserRoleDto } from "./dto/update-user-role.dto.js";
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { UpdateUserDetailsDto } from "./dto/update-user-details.dto.js";

@Controller(API_PATHS.USER)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getOneUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getOneUser(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id/role')
  updateRole(@Param("id", ParseUUIDPipe) id: string, @Body() payload: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, payload);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, payload);
  }

  @Patch(":id/details")
  updateUserProfile(@Param("id", ParseUUIDPipe) id: string, @Body() payload: UpdateUserDetailsDto) {
    return this.usersService.updateUserProfile(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }
}
