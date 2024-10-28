import { Injectable } from '@nestjs/common';
import { CreateRolesAndPermissionDto } from './dto/create-role.dto';
import { UpdateRolesAndPermissionDto } from './dto/update-role.dto';

@Injectable()
export class RolesAndPermissionsService {
  create(createRolesAndPermissionDto: CreateRolesAndPermissionDto) {
    return 'This action adds a new rolesAndPermission';
  }

  findAll() {
    return `This action returns all rolesAndPermissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolesAndPermission`;
  }

  update(id: number, updateRolesAndPermissionDto: UpdateRolesAndPermissionDto) {
    return `This action updates a #${id} rolesAndPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolesAndPermission`;
  }
}
