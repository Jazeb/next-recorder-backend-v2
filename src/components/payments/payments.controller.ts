import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SignedInUser } from 'src/decorators/user.decorator';
import { IAuthTokenResponse } from 'src/types/types';
import { CreatePaymentDto } from 'src/dtos/dto';
import { PaymentsInterface } from 'src/interfaces/interfaces';
import { PaymentsService } from 'src/services/payments.service';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      return await this.paymentsService.handleWebhookEvent(
        request.rawBody,
        signature,
      );
    } catch (error) {
      throw error;
    }
  }
}
