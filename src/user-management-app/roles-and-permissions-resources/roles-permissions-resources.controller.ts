import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesPermissionsResourcesService } from './roles-permissions-resources.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';
import { UserRolesDto } from './dto/user-roles.dto';
import { UserRolesEntity } from './entities/user-roles.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('roles-and-permissions')
@ApiTags('roles-and-permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@ApiBearerAuth()
export class RolesPermissionsResourcesController {
  constructor(
    private readonly rolesPermissionsResourcesService: RolesPermissionsResourcesService,
  ) {}
  //########################### Create and Assign #################################
  @Post('create-role')
  @ApiCreatedResponse({ type: RoleEntity })
  @Permissions(2, 'MANAGE')
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    return await this.rolesPermissionsResourcesService.createRole(
      createRoleDto,
    );
  }

  @Post('create-permission')
  @ApiCreatedResponse({ type: PermissionEntity })
  @Roles('Admin')
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    return await this.rolesPermissionsResourcesService.createPermission(
      createPermissionDto,
    );
  }

  @Post('create-userRole')
  @ApiCreatedResponse({ type: UserRolesEntity })
  @Roles('Admin')
  async createUserRole(
    @Body() userRolesDto: UserRolesDto,
  ): Promise<UserRolesEntity> {
    return await this.rolesPermissionsResourcesService.createUserRole(
      userRolesDto,
    );
  }

  //########################### Get many Roles and many Permissions #################################
  @Get('roles')
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  async getAllRoles(): Promise<RoleEntity[]> {
    return await this.rolesPermissionsResourcesService.findAllRoles();
  }

  @Get('roles-and-permissions')
  @ApiOkResponse({ type: RoleEntity, isArray: true })
  async getAllRolesWithPermissions(): Promise<RoleEntity[]> {
    return await this.rolesPermissionsResourcesService.findAllRolesWithPermissions();
  }

  @Get('permissions')
  @ApiOkResponse({ type: PermissionEntity, isArray: true })
  async getAllPermissions(): Promise<PermissionEntity[]> {
    return await this.rolesPermissionsResourcesService.findAllPermissions();
  }

  //########################### Get unique Roles and unique Permissions #################################

  @Get('role/:id')
  @ApiOkResponse({ type: RoleEntity })
  async findOneRole(@Param('id') id: string): Promise<RoleEntity> {
    return await this.rolesPermissionsResourcesService.findOneRole(+id);
  }

  @Get('permission/:id')
  @ApiOkResponse({ type: PermissionEntity })
  async findOnePermission(@Param('id') id: string): Promise<PermissionEntity> {
    return await this.rolesPermissionsResourcesService.findOnePermission(+id);
  }

  @Get('user-roles/:userId')
  @ApiOkResponse({ type: UserRolesEntity, isArray: true })
  async getAllUserRolesByUserId(
    @Param('userId') userId: string,
  ): Promise<UserRolesEntity[]> {
    return await this.rolesPermissionsResourcesService.findUserRolesByUserId(
      +userId,
    );
  }

  //########################### Update unique Roles and unique Permissions #################################

  @Patch('role/:roleId')
  @ApiOkResponse({ type: RoleEntity })
  @Roles('Admin')
  async updateRole(
    @Param('roleId') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
    return await this.rolesPermissionsResourcesService.updateRole(
      +id,
      updateRoleDto,
    );
  }

  @Patch('permission/:permissionId')
  @ApiOkResponse({ type: PermissionEntity })
  @Roles('Admin')
  async updatePermission(
    @Param('permissionId') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    return await this.rolesPermissionsResourcesService.updatePermission(
      +id,
      updatePermissionDto,
    );
  }

  //########################### Update unique Roles and unique Permissions #################################

  @Delete('role/:id')
  @Roles('Admin')
  @ApiOkResponse({ type: RoleEntity })
  async removeRole(@Param('id') id: string): Promise<RoleEntity> {
    return await this.rolesPermissionsResourcesService.removeRole(+id);
  }

  @Delete('permission/:id')
  @Roles('Admin')
  @ApiOkResponse({ type: PermissionEntity })
  async removePermission(@Param('id') id: string): Promise<PermissionEntity> {
    return await this.rolesPermissionsResourcesService.removePermission(+id);
  }

  @Delete('userRole')
  @Roles('Admin')
  @ApiOkResponse({ type: UserRolesEntity })
  async removeUserRole(
    @Body() userRolesDto: UserRolesDto,
  ): Promise<UserRolesEntity> {
    return await this.rolesPermissionsResourcesService.removeUserRole(
      userRolesDto.userId,
      userRolesDto.roleId,
    );
  }
}
