import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignedInUser } from 'src/decorators/user.decorator';
import { CreateNewPlanDto } from 'src/dtos/dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { PlanInterface } from 'src/interfaces/interfaces';
import { PlansService } from 'src/services/plans.service';
import { IAuthTokenResponse } from 'src/types/types';

@ApiTags('Plans')
@Controller('plans')
@ApiBearerAuth()
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  getAllPlans(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<PlanInterface[]> {
    try {
      return this.plansService.getAllPlans(page, pageSize);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getPlanById(@Param('id') id: string): Promise<PlanInterface> {
    try {
      return this.plansService.getPlanById(id);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  createNewPlan(
    @Body() payload: CreateNewPlanDto,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<PlanInterface> {
    try {
      return this.plansService.createNewPlan(payload, userId);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<PlanInterface> {
    try {
      return this.plansService.deletePlan(id);
    } catch (error) {
      throw error;
    }
  }
}
