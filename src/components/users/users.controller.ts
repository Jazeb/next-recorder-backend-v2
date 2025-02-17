import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignedInUser } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import {
  AttachmentInterface,
  FolderInterface,
  UserInterface,
} from 'src/interfaces/interfaces';
import { UsersService } from 'src/services/users.service';
import { IAuthTokenResponse } from 'src/types/types';

@ApiTags('Users')
@Controller('user')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ADMIN - GET ALL USERS

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('pageSize') pagesSize: number = 10,
  ): Promise<{ data: UserInterface[]; total: number }> {
    try {
      return await this.usersService.findAll(Number(page), Number(pagesSize));
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Body() payload: UserInterface): Promise<UserInterface> {
    try {
      return await this.usersService.create(payload);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getFoldersFilesForDashboard(
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<{ folders: FolderInterface[]; files: AttachmentInterface[] }> {
    try {
      return await this.usersService.getFoldersFilesForDashboard(userId);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneById(@Param('id') id: string): Promise<UserInterface> {
    try {
      return await this.usersService.findOneById(id);
    } catch (error) {
      throw error;
    }
  }
}
