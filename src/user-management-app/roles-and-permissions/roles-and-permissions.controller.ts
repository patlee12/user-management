import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RolesAndPermissionsService } from './roles-and-permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { UserRolesDto } from './dto/user-roles.dto';
import { UserRolesEntity } from './entities/user-roles.entity';

@Controller('roles-and-permissions')
@ApiTags('roles-and-permissions')
export class RolesAndPermissionsController {
  constructor(
    private readonly rolesAndPermissionsService: RolesAndPermissionsService,
  ) {}
  //########################### Create and Assign #################################
  @Post('create-role')
  @ApiCreatedResponse({ type: RoleEntity })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    return await this.rolesAndPermissionsService.createRole(createRoleDto);
  }

  @Post('create-permission')
  @ApiCreatedResponse({ type: PermissionEntity })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    return await this.rolesAndPermissionsService.createPermission(
      createPermissionDto,
    );
  }

  @Post('create-userRole')
  @ApiCreatedResponse({ type: UserRolesEntity })
  async createUserRole(
    @Body() userRolesDto: UserRolesDto,
  ): Promise<UserRolesEntity> {
    return await this.rolesAndPermissionsService.createUserRole(userRolesDto);
  }

  //########################### Get many Roles and many Permissions #################################
  @Get('roles')
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  async getAllRoles(): Promise<RoleEntity[]> {
    return await this.rolesAndPermissionsService.findAllRoles();
  }

  @Get('roles-and-permissions')
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  async getAllRolesWithPermissions(): Promise<RoleEntity[]> {
    return await this.rolesAndPermissionsService.findAllRolesWithPermissions();
  }

  @Get('permissions')
  @ApiOkResponse({ type: PermissionEntity, isArray: true })
  async getAllPermissions(): Promise<PermissionEntity[]> {
    return await this.rolesAndPermissionsService.findAllPermissions();
  }

  //########################### Get unique Roles and unique Permissions #################################

  @Get('role/:id')
  @ApiOkResponse({ type: RoleEntity })
  async findOneRole(@Param('id') id: string): Promise<RoleEntity> {
    return await this.rolesAndPermissionsService.findOneRole(+id);
  }

  @Get('permission/:id')
  @ApiOkResponse({ type: PermissionEntity })
  async findOnePermission(@Param('id') id: string): Promise<PermissionEntity> {
    return await this.rolesAndPermissionsService.findOnePermission(+id);
  }

  @Get('user-roles/:userId')
  @ApiOkResponse({ type: UserRolesEntity, isArray: true })
  async getAllUserRolesByUserId(
    @Param('userId') userId: string,
  ): Promise<UserRolesEntity[]> {
    return await this.rolesAndPermissionsService.findUserRolesByUserId(+userId);
  }

  //########################### Update unique Roles and unique Permissions #################################

  @Patch('role/:roleId')
  @ApiOkResponse({ type: RoleEntity })
  async updateRole(
    @Param('roleId') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    return await this.rolesAndPermissionsService.updateRole(+id, updateRoleDto);
  }

  @Patch('permission/:permissionId')
  @ApiOkResponse({ type: PermissionEntity })
  async updatePermission(
    @Param('permissionId') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    return await this.rolesAndPermissionsService.updatePermission(
      +id,
      updatePermissionDto,
    );
  }

  //########################### Update unique Roles and unique Permissions #################################

  @Delete('role/:id')
  @ApiOkResponse({ type: RoleEntity })
  async removeRole(@Param('id') id: string): Promise<RoleEntity> {
    return await this.rolesAndPermissionsService.removeRole(+id);
  }

  @Delete('permission/:id')
  @ApiOkResponse({ type: PermissionEntity })
  async removePermission(@Param('id') id: string): Promise<PermissionEntity> {
    return await this.rolesAndPermissionsService.removePermission(+id);
  }

  @Delete('userRole')
  @ApiOkResponse({ type: UserRolesEntity })
  async removeUserRole(
    @Body() userRolesDto: UserRolesDto,
  ): Promise<UserRolesEntity> {
    return await this.rolesAndPermissionsService.removeUserRole(
      userRolesDto.userId,
      userRolesDto.roleId,
    );
  }
}
