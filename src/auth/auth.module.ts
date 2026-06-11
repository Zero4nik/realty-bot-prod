import { Module } from '@nestjs/common';
import { adminGuard } from './admin.guard';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  providers: [adminGuard, PrismaService],
  exports: [adminGuard],
})
export class AuthModule {}
