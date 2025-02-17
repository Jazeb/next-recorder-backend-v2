import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';
import { compareHash, generateHashForPassword } from 'src/common';
import { Collections } from 'src/constants';
import { LoginDto, SignUp } from 'src/dtos/dto';
import { UserInterface } from 'src/interfaces/interfaces';
import { IAuthTokenResponse } from 'src/types/types';

@Injectable()
export class AuthService {
  private oauthClient: OAuth2Client;
  @InjectModel(Collections.users) private userModel: Model<UserInterface>;
  constructor(private readonly jwtService: JwtService) {
    this.oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async login(payload: LoginDto): Promise<IAuthTokenResponse> {
    try {
      const user = await this.userModel
        .findOne({ email: payload.email })
        .exec();
      if (!user) {
        throw new Error('User not found');
      }
      const isPasswordValid = await compareHash(
        payload.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const responsePayload = {
        userId: user._id as unknown as string,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        ...responsePayload,
        access_token: this.jwtService.sign(responsePayload),
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async signInWithGoogle(googleIdToken: string): Promise<IAuthTokenResponse> {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: googleIdToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Invalid Google token');
      }

      const { email, sub: googleId, name, picture } = payload;

      let user = await this.userModel
        .findOneAndUpdate(
          { email },
          {
            $setOnInsert: {
              name,
              googleId,
              profilePicture: picture,
              email,
            },
          },
          { new: true, upsert: true },
        )
        .exec();

      const responsePayload = {
        userId: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        ...responsePayload,
        access_token: this.jwtService.sign(responsePayload),
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async signup(payload: SignUp): Promise<{ message: string }> {
    try {
      const {
        name,
        email,
        password,
        billingCardNumber,
        billingCardExpiry,
        billingCardCvc,
      } = payload;
      const doc = await this.userModel.findOne({ email }).exec();
      if (doc) {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }
      const passwordHash = await generateHashForPassword(password);
      await this.userModel.create({
        name,
        email,
        billingCardNumber,
        billingCardExpiry,
        billingCardCvc,
        password: passwordHash,
      });

      return {
        message: 'Sign up successfull. Proceed to the login page for login.',
      };
    } catch (error) {
      throw error;
    }
  }
}
