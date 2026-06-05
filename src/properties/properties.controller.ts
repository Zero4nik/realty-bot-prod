import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
    @Body() data: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const photoUrls = files.map((files) => `/uploads/${files.filename}`);
    return this.PropertiesService.create({
      ...data,
      photos: JSON.stringify(photoUrls),
      rooms: Number(data.rooms),
      price: Number(data.price),
      area: Number(data.area),
      floor: Number(data.floor),
      totalFloors: Number(data.totalFlors),
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
