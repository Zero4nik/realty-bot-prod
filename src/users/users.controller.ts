import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  async create(
    @Body()
    body: {
      telegramId: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      referralCode?: string;
    },
  ) {
    return this.usersService.create(body);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':telegramId')
  async getProfile(@Param('telegramId') telegramId: string) {
    const user = await this.usersService.getProfile(telegramId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }
  @Get(':telegramId/transactions')
  async getTransactions(@Param('telegramId') telegramId: string) {
    return this.usersService.getTransactions(telegramId);
  }
  @Get(':telegramId/referrals')
  async getReferrals(@Param('telegramId') telegramId: string) {
    return this.usersService.getReferrals(telegramId);
  }
}
