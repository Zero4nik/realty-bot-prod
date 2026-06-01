import { Get, Controller, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { adminGuard } from 'src/auth/admin.guard';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(adminGuard)
  async getStats() {
    return this.dashboardService.getStats();
  }
}
