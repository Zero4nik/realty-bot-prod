import { Controller, Post, Body } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
@Controller('api/inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  async create(@Body() body: { userId: number; propertyId: number }) {
    const inquiry = await this.inquiriesService.create(body);

    console.log('НОВАЯ ЗАЯВКА:', inquiry);

    return inquiry;
  }
}
