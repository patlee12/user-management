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
import { AccountRequestsService } from './account-requests.service';
import { CreateAccountRequestDto } from './dto/create-account-request.dto';
import { UpdateAccountRequestDto } from './dto/update-account-request.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VerifyAccountRequestDto } from './dto/verify-account-request.dto';
import { AccountRequestEntity } from './entities/account-request.entity';
import { UserEntity } from '../users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles-and-permissions-resources/roles.guard';
import { Roles } from '../roles-and-permissions-resources/roles.decorator';

@Controller('account-requests')
@ApiTags('account-requests')
export class AccountRequestsController {
  constructor(
    private readonly accountRequestsService: AccountRequestsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: AccountRequestEntity })
  async create(
    @Body() createAccountRequestDto: CreateAccountRequestDto,
  ): Promise<AccountRequestEntity> {
    const newAccountRequest = await this.accountRequestsService.create(
      createAccountRequestDto,
    );
    return plainToInstance(AccountRequestEntity, newAccountRequest);
  }

  @Post('verify')
  @ApiCreatedResponse({ type: UserEntity })
  async verifyAccountRequest(
    @Body() verifyAccountRequestDto: VerifyAccountRequestDto,
  ): Promise<UserEntity> {
    const newUserAccount =
      await this.accountRequestsService.verifyAccountRequest(
        verifyAccountRequestDto,
      );
    return plainToInstance(UserEntity, newUserAccount);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOkResponse({ type: AccountRequestEntity, isArray: true })
  async findAll(): Promise<AccountRequestEntity[]> {
    const allAccountRequests = await this.accountRequestsService.findAll();
    return plainToInstance(AccountRequestEntity, allAccountRequests);
  }

  @Get(':id')
  @ApiOkResponse({ type: AccountRequestEntity })
  async findOne(@Param('id') id: string): Promise<AccountRequestEntity> {
    const accountRequest = await this.accountRequestsService.findOne(+id);
    return plainToInstance(AccountRequestEntity, accountRequest);
  }

  @Get('byEmail/:email')
  @ApiOkResponse({ type: AccountRequestEntity })
  async findOneByEmail(
    @Param('email') email: string,
  ): Promise<AccountRequestEntity> {
    const accountRequest =
      await this.accountRequestsService.findOneByEmail(email);
    return plainToInstance(AccountRequestEntity, accountRequest);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOkResponse({ type: AccountRequestEntity })
  async update(
    @Param('id') id: string,
    @Body() updateAccountRequestDto: UpdateAccountRequestDto,
  ): Promise<AccountRequestEntity> {
    const updatedAccountRequest = await this.accountRequestsService.update(
      +id,
      updateAccountRequestDto,
    );
    return plainToInstance(AccountRequestEntity, updatedAccountRequest);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOkResponse({ type: AccountRequestEntity })
  async remove(@Param('id') id: string): Promise<AccountRequestEntity> {
    const removedAccountRequest = await this.accountRequestsService.remove(+id);
    return plainToInstance(AccountRequestEntity, removedAccountRequest);
  }
}
