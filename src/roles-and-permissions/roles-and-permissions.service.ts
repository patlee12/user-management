import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UserRolesDto } from './dto/user-roles.dto';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from './entities/permission.entity';
import { UserRolesEntity } from './entities/user-roles.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class RolesAndPermissionsService {
  constructor(private prisma: PrismaService) {}

  //########################### Create and Assign #################################
  async createRole(createRoleDto: CreateRoleDto) {
    const createRoleData = {
      ...createRoleDto,
      permissions: {
        create: createRoleDto.permissions?.map(
          (permission: CreatePermissionDto) => ({
            name: permission.name,
            actionType: permission.actionType,
            description: permission.description,
            resourceId: permission.resourceId,
            isActive: permission.isActive,
            createdBy: permission.createdBy,
            updatedBy: permission.updatedBy,
          }),
        ),
      },
    };

    return await this.prisma.role.create({
      data: createRoleData,
    });
  }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const createPermissionData = {
      ...createPermissionDto,
      roles: {
        create: createPermissionDto.roles?.map((role: CreateRoleDto) => ({
          name: role.name,
          description: role.description,
          createdBy: role.createdBy,
          updatedBy: role.updatedBy,
        })),
      },
    };

    return await this.prisma.permission.create({
      data: createPermissionData,
    });
  }

  async createUserRole(userRolesDto: UserRolesDto) {
    const assignUserRole = await this.prisma.userRoles.create({
      data: userRolesDto,
    });
    return assignUserRole;
  }
  //########################### Get many Roles and many Permissions #################################
  async findAllRoles(): Promise<RoleEntity[]> {
    const allRolesWithPermissions = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    return allRolesWithPermissions.map((role) => {
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        permissionIds: role.permissions.map((permission) => permission.id),
        createdBy: role.createdBy,
        updatedBy: role.updatedBy,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
  }

  async findAllRolesWithPermissions(): Promise<RoleEntity[]> {
    const allRolesWithPermissions = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    return allRolesWithPermissions.map((role) => {
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        permissionObject: role.permissions,
        createdBy: role.createdBy,
        updatedBy: role.updatedBy,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
  }

  async findAllPermissions(): Promise<PermissionEntity[]> {
    const allPermissions = await this.prisma.permission.findMany({});

    return allPermissions;
  }

  //########################### Get unique Roles and unique Permissions #################################

  async findOneRole(id: number): Promise<RoleEntity> {
    return await this.prisma.role.findUnique({
      where: { id: id },
      include: { permissions: true },
    });
  }

  async findOnePermission(id: number): Promise<PermissionEntity> {
    return await this.prisma.permission.findUnique({ where: { id: id } });
  }

  async findUserRolesByUserId(userId: number): Promise<UserRolesEntity[]> {
    return await this.prisma.userRoles.findMany({ where: { userId: userId } });
  }

  //########################### Update unique Roles and unique Permissions #################################

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    const { permissions, ...data } = updateRoleDto;

    const updateRole: Prisma.RoleUpdateInput = {
      ...data,
      permissions: permissions
        ? {
            connect: await permissions.map((permission) => ({
              id: permission.id,
            })),
          }
        : undefined,
    };

    return await this.prisma.role.update({
      where: { id },
      data: updateRole,
    });
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    const { roles, ...data } = updatePermissionDto;

    const updatePermission: Prisma.PermissionUpdateInput = {
      ...data,
      roles: roles
        ? {
            connect: await roles.map((role) => ({
              id: role.id,
            })),
          }
        : undefined,
    };

    return await this.prisma.permission.update({
      where: { id },
      data: updatePermission,
    });
  }

  //########################### Delete unique Roles and unique Permissions #################################

  async removeRole(id: number) {
    return await this.prisma.role.delete({ where: { id: id } });
  }

  async removePermission(id: number) {
    return await this.prisma.permission.delete({ where: { id: id } });
  }

  async removeUserRole(userId: number, roleId: number) {
    return await this.prisma.userRoles.delete({
      where: { userId_roleId: { userId: userId, roleId: roleId } },
    });
  }
}
