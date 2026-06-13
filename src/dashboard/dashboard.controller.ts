import { Get, Controller, Headers } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getStats(@Headers('x-user-id') userId: string) {
    return this.dashboardService.getStats(userId);
  }
}
