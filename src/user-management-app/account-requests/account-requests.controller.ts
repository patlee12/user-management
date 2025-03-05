import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountRequestsService } from './account-requests.service';
import { CreateAccountRequestDto } from './dto/create-account-request.dto';
import { UpdateAccountRequestDto } from './dto/update-account-request.dto';

@Controller('account-requests')
export class AccountRequestsController {
  constructor(
    private readonly accountRequestsService: AccountRequestsService,
  ) {}

  @Post()
  create(@Body() createAccountRequestDto: CreateAccountRequestDto) {
    return this.accountRequestsService.create(createAccountRequestDto);
  }

  @Get()
  findAll() {
    return this.accountRequestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountRequestsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountRequestDto: UpdateAccountRequestDto,
  ) {
    return this.accountRequestsService.update(+id, updateAccountRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountRequestsService.remove(+id);
  }
}
