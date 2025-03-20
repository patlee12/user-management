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
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RolesPermissionsResourcesService {
  constructor(private prisma: PrismaService) {}

  //########################### Create and Assign #################################

  /**
   * Create a new role.
   * @param createRoleDto
   * @returns {Role}
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const createRoleData = {
      ...createRoleDto,
      permissions: {
        create: createRoleDto.permissions?.map(
          (permission: CreatePermissionDto) => ({
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

  /**
   * Create a new permission.
   * @param createPermissionDto
   * @returns {PermissionEntity}
   */
  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
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

  /**
   * Assign a role to a user.
   * @param userRolesDto
   * @returns {UserRolesEntity}
   */
  async createUserRole(userRolesDto: UserRolesDto): Promise<UserRolesEntity> {
    const assignUserRole = await this.prisma.userRoles.create({
      data: userRolesDto,
    });
    return assignUserRole;
  }

  //########################### Get many Roles and many Permissions #################################

  /**
   *Find all roles including permissionIds.
   * @returns {RoleEntity[]}
   */
  async findAllRoles(): Promise<RoleEntity[]> {
    const allRolesWithPermissions = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    return await allRolesWithPermissions.map((role: RoleEntity) => {
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

  /**
   * Find all roles and include entire permission entity.
   * @returns {RoleEntity[]}
   */
  async findAllRolesWithPermissions(): Promise<RoleEntity[]> {
    const allRolesWithPermissions = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    return await allRolesWithPermissions.map((role: RoleEntity) => {
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        permission: role.permissions,
        createdBy: role.createdBy,
        updatedBy: role.updatedBy,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    });
  }

  /**
   * Find all Permissions.
   * @returns {PermissionEntity[]}
   */
  async findAllPermissions(): Promise<PermissionEntity[]> {
    const allPermissions = await this.prisma.permission.findMany({});

    return allPermissions;
  }

  //########################### Get unique Roles and unique Permissions #################################

  /**
   * Find one role by id and include permissions for that role.
   * @param id
   * @returns {RoleEntity}
   */
  async findOneRole(id: number): Promise<RoleEntity> {
    return await this.prisma.role.findUnique({
      where: { id: id },
      include: { permissions: true },
    });
  }

  /**
   * Find one permission by id.
   * @param id
   * @returns {PermissionEntity}
   */
  async findOnePermission(id: number): Promise<PermissionEntity> {
    return await this.prisma.permission.findUnique({ where: { id: id } });
  }

  /**
   * Find all roles by UserId and include their permissions.
   * @param userId
   * @returns {UserRolesEntity[]}
   */
  async findUserRolesByUserId(userId: number): Promise<UserRolesEntity[]> {
    return await this.prisma.userRoles.findMany({
      where: { userId: userId },
      include: { role: { include: { permissions: true } } },
    });
  }

  //########################### Update unique Roles and unique Permissions #################################

  /**
   * Updates an existing role by its ID.
   *
   * If `permissions` are provided in `updateRoleDto`, they will be updated by associating the role with the specified permission IDs.
   * Otherwise, only the role details will be updated.
   *
   * @param id
   * @param updateRoleDto
   * @returns {Promise<RoleEntity>} - The updated role entity.
   */
  async updateRole(
    id: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleEntity> {
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

  /**
   * Updates an existing permission by its ID.
   *
   * If `roles` are provided in `updatePermissionDto`, the permission will be updated to include these roles.
   *
   * If `roles` are omitted, only the permission's other attributes will be modified.
   * @param id
   * @param updatePermissionDto
   * @returns {Promise<PermissionEntity>} - The updated permission entity.
   */
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

  /**
   * Remove role by id.
   * @param id
   * @returns {RoleEntity}
   */
  async removeRole(id: number): Promise<RoleEntity> {
    return await this.prisma.role.delete({ where: { id: id } });
  }

  /**
   * Remove permission by id.
   * @param id
   * @returns {PermissionEntity}
   */
  async removePermission(id: number): Promise<PermissionEntity> {
    return await this.prisma.permission.delete({ where: { id: id } });
  }

  /**
   * Un-assign user role.
   * @param userId
   * @param roleId
   * @returns {UserRolesEntity}
   */
  async removeUserRole(
    userId: number,
    roleId: number,
  ): Promise<UserRolesEntity> {
    return await this.prisma.userRoles.delete({
      where: { userId_roleId: { userId: userId, roleId: roleId } },
    });
  }
}
