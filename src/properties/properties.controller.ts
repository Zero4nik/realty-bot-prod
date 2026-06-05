import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

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
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: memoryStorage(),
    }),
  )
  async create(
    @Body() data: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const photoUrls: string[] = [];

    if (files) {
      for (const file of files) {
        const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        photoUrls.push(base64);
      }
    }

    return this.PropertiesService.create({
      title: data.title,
      city: data.city,
      district: data.district || '',
      type: data.type,
      rooms: Number(data.rooms) || 1,
      price: Number(data.price) || 0,
      area: Number(data.area) || 0,
      floor: Number(data.floor) || 0,
      totalFloors: Number(data.totalFloors) || 0,
      address: data.address,
      description: data.description || '',
      photos: JSON.stringify(photoUrls),
      balcony: data.balcony === 'true',
      terrace: data.terrace === 'true',
      parking: data.parking === 'true',
      pets: data.pets === 'true',
      conditioner: data.conditioner === 'true',
      separateKitchen: data.separateKitchen === 'true',
    });
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
