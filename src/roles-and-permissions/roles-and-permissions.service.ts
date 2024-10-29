import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesAndPermissionsService {
  constructor(private prisma: PrismaService) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const createRoleData = {
      ...createRoleDto,
      permissions: {
        create: createRoleDto.permissions?.map(
          (permission: CreatePermissionDto) => ({
            name: permission.name,
            description: permission.description,
          }),
        ),
      },
    };

    return this.prisma.role.create({
      data: createRoleData,
    });
  }

  findAll() {
    return `This action returns all rolesAndPermissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolesAndPermission`;
  }

  update(id: number, UpdateRoleDto: UpdateRoleDto) {
    return UpdateRoleDto;
  }

  remove(id: number) {
    return `This action removes a #${id} rolesAndPermission`;
  }
}
