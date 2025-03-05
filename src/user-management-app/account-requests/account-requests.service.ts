import { Injectable } from '@nestjs/common';
import { CreateAccountRequestDto } from './dto/create-account-request.dto';
import { UpdateAccountRequestDto } from './dto/update-account-request.dto';

@Injectable()
export class AccountRequestsService {
  create(createAccountRequestDto: CreateAccountRequestDto) {
    return 'This action adds a new accountRequest';
  }

  findAll() {
    return `This action returns all accountRequests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountRequest`;
  }

  update(id: number, updateAccountRequestDto: UpdateAccountRequestDto) {
    return `This action updates a #${id} accountRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountRequest`;
  }
}
