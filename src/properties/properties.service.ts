import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}
  async findAll(filters: any) {
    const where: any = { isActive: true };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { district: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.city) where.city = filters.city;
    if (filters.type) where.type = filters.type;
    if (filters.district) where.district = { district: filters.district };

    if (filters.rooms) {
      where.rooms = filters.rooms === '4' ? { gte: 4 } : Number(filters.room);
    }
    if (filters.priceFrom || filters.priceTo) {
      where.price = {};
      if (filters.priceFrom) where.priceFrom.gte = Number(filters.priceFrom);
      if (filters.priceTo) where.priceTo.lte = Number(filters.priceTo);
    }
    if (filters.AreaFrom || filters.AreaTo) {
      where.area = {};
      if (filters.AreaFrom) where.AreaFrom.gte = Number(filters.AreaFrom);
      if (filters.AreaTo) where.AreaTo.lte = Number(filters.AreaTo);
    }
    if (filters.floorFrom || filters.floorTo) {
      where.floor = {};
      if (filters.priceFrom) where.floorFrom.gte = Number(filters.floorFrom);
      if (filters.floorTo) where.floorTo.lte = Number(filters.floorTo);
    }
    return this.prisma.property.findMany({ where });
  }
  async findOne(id: number) {
    return this.prisma.property.findUnique({ where: { id } });
  }
  async create(data: any) {
    return this.prisma.property.create({ data });
  }
  async update(id: number, data: any) {
    return this.prisma.property.update({ where: { id }, data });
  }
  async delete(id: number) {
    return this.prisma.property.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
