import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('api/properties')
export class PropertiesController {
  constructor(private readonly PropertiesService: PropertiesService) {}
  @Get()
  findAll(@Query() query: any) {
    return this.PropertiesService.findAll(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.PropertiesService.findOne(+id);
  }
  @Post()
  create(@Body() data: any) {
    return this.PropertiesService.create(data);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.PropertiesService.update(+id, data);
  }
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.PropertiesService.delete(+id);
  }
}
