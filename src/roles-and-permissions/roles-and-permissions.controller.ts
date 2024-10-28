import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RolesAndPermissionsService } from './roles-and-permissions.service';
import { CreateRolesAndPermissionDto } from './dto/create-role.dto';
import { UpdateRolesAndPermissionDto } from './dto/update-role.dto';

@Controller('roles-and-permissions')
export class RolesAndPermissionsController {
  constructor(
    private readonly rolesAndPermissionsService: RolesAndPermissionsService,
  ) {}

  @Post()
  create(@Body() createRolesAndPermissionDto: CreateRolesAndPermissionDto) {
    return this.rolesAndPermissionsService.create(createRolesAndPermissionDto);
  }

  @Get()
  findAll() {
    return this.rolesAndPermissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesAndPermissionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRolesAndPermissionDto: UpdateRolesAndPermissionDto,
  ) {
    return this.rolesAndPermissionsService.update(
      +id,
      updateRolesAndPermissionDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesAndPermissionsService.remove(+id);
  }
}
