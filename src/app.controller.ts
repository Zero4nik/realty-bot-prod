import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('api/clear-test-data')
  async clearTestData() {
    await this.prisma.message.deleteMany({});
    await this.prisma.transaction.deleteMany({});
    await this.prisma.inquiry.deleteMany({});
    await this.prisma.property.deleteMany({});
    return { done: true, message: 'Все данные кроме пользователей удалены' };
  }
}
