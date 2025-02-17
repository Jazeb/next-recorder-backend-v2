import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileTypes } from 'src/constants';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { ReportsService } from 'src/services/reports.service';

@Controller('report')
@ApiTags('Report')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':fileId')
  async reportMediaItem(@Param('fileId') fileId: string) {
    try {
      return await this.reportsService.reportMediaItem(fileId);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/media')
  async getAllReportedFiles(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('fileType') fileType: FileTypes,
  ) {
    try {
      return await this.reportsService.getAllReportedMediaItems(
        Number(page),
        Number(pageSize),
        fileType || null,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/media-counts')
  async getAllReportedMediaItemsCount(): Promise<{
    imageCount: number;
    videoCount: number;
    overallCount: number;
  }> {
    try {
      return await this.reportsService.getAllReportedMediaItemsCount();
    } catch (error) {
      throw error;
    }
  }
}
