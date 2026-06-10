import { Get, Controller, UseGuards, Headers } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { adminGuard } from 'src/auth/admin.guard';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(adminGuard)
  async getStats(@Headers('x-user-id') userId: string) {
    return this.dashboardService.getStats(userId);
  }
}
