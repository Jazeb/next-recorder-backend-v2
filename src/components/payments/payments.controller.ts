import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SignedInUser } from 'src/decorators/user.decorator';
import { IAuthTokenResponse } from 'src/types/types';
import { CreatePaymentDto } from 'src/dtos/dto';
import { PaymentsInterface } from 'src/interfaces/interfaces';
import { PaymentsService } from 'src/services/payments.service';
@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  async createPaymentRecord(
    @Body() payload: CreatePaymentDto,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<PaymentsInterface> {
    try {
      return await this.paymentsService.createPaymentRecord(payload, userId);
    } catch (error) {
      throw error;
    }
  }
}
