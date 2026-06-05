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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';

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
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Req() req: Request,
    @Body() body: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const isFormData = req.headers['content-type']?.includes(
      'multipart/form-data',
    );

    let photoUrls: string[] = [];

    if (isFormData && files && files.length > 0) {
      photoUrls = files.map((file) => `/uploads/${file.filename}`);
    } else if (body.photos) {
      try {
        photoUrls = JSON.parse(body.photos);
      } catch {
        photoUrls = body.photos.split(',').map((s: string) => s.trim());
      }
    }

    const data = isFormData ? body : body;

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
      balcony: data.balcony === 'true' || data.balcony === true,
      terrace: data.terrace === 'true' || data.terrace === true,
      parking: data.parking === 'true' || data.parking === true,
      pets: data.pets === 'true' || data.pets === true,
      conditioner: data.conditioner === 'true' || data.conditioner === true,
      separateKitchen:
        data.separateKitchen === 'true' || data.separateKitchen === true,
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
