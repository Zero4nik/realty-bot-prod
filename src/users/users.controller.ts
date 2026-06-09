import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private prisma: PrismaService,
  ) {}

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
  @Put(':telegramId')
  async updateUser(
    @Param('telegramId') telegramId: string,
    @Body() body: { role?: string },
  ) {
    return this.usersService.updateRole(telegramId, body.role);
  }
  @Put(':telegramId/profile')
  async updateProfile(
    @Param('telegramId') telegramId: string,
    @Body() body: { phone?: string; about?: string },
  ) {
    return this.prisma.user.update({
      where: { telegramId },
      data: { phone: body.phone, about: body.about },
    });
  }
}
