import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Put,
  Headers,
} from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
@Controller('api/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.inquiriesService.findAll(status, userId);
  }

  @Post()
  async create(@Body() body: { userId: number; propertyId: number }) {
    const inquiry = await this.inquiriesService.create(body);

    console.log('НОВАЯ ЗАЯВКА:', inquiry);

    return inquiry;
  }
  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.inquiriesService.getMessages(+id);
  }
  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Headers('x-user-id') telegramId: string,
    @Body() body: { text: string },
  ) {
    return this.inquiriesService.sendMessage(+id, telegramId, body.text);
  }
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; amount?: number },
  ) {
    return this.inquiriesService.updateStatus(+id, body.status, body.amount);
  }
}
