import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto, SignUp } from 'src/dtos/dto';
import { AuthService } from 'src/services/auth.service';
import { IAuthTokenResponse } from 'src/types/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signup(@Body() body: SignUp): Promise<{ message: string }> {
    try {
      return await this.authService.signup(body);
    } catch (error) {
      throw error;
    }
  }

  @Post('google/sign-in')
  @ApiBody({
    description: 'Google Sign-In Request Body',
    schema: {
      type: 'object',
      properties: {
        idToken: {
          type: 'string',
          description:
            'The ID token received from Google during the sign-in process',
        },
      },
      required: ['idToken'],
    },
  })
  async googleSignIn(
    @Body() body: { idToken: string },
  ): Promise<IAuthTokenResponse> {
    return await this.authService.signInWithGoogle(body.idToken);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }
}
