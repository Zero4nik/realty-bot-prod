import { Controller, Post, Body, Get, Query, Param, Put } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
@Controller('api/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.inquiriesService.findAll(status);
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
    @Body() body: { userId: number; text: string },
  ) {
    return this.inquiriesService.sendMessage(+id, body.userId, body.text);
  }
  @Put('id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; amount?: number },
  ) {
    return this.inquiriesService.updateStatus(+id, body.status, body.amount);
  }
}
