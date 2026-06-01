import { Module } from '@nestjs/common';
import { adminGuard } from './admin.guard';

@Module({
  providers: [adminGuard],
  exports: [adminGuard],
})
export class AuthModule {}
