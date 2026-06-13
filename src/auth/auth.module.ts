import { Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  providers: [AdminGuard, PrismaService],
  exports: [AdminGuard],
})
export class AuthModule {}
