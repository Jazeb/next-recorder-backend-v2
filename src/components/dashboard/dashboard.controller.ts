import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { DashboardService } from 'src/services/dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('revenue/stats')
  async getOverallRevenueStats(): Promise<{
    thisYear: number;
    thisMonth: number;
    thisWeek: number;
    overall: number;
    currency?: string;
  }> {
    try {
      return await this.dashboardService.getOverallRevenueStats();
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/stats')
  async getOverallUsersStats(): Promise<{
    totalUsers: number;
    premiumUsers: number;
    freeUsers: number;
    nonActiveUsers: number;
    reportsCount?: number;
  }> {
    try {
      return await this.dashboardService.getOverallUsersStats();
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('media/stats')
  async getMediaStatsForYear(): Promise<
    { month: string; images: number; videos: number }[]
  > {
    try {
      return await this.dashboardService.getMediaStatsForYear();
    } catch (error) {
      throw error;
    }
  }
}
