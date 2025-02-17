import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SignedInUser } from 'src/decorators/user.decorator';
import { CreateFolderDto, MoveFolderDto } from 'src/dtos/dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import {
  AttachmentInterface,
  FolderInterface,
} from 'src/interfaces/interfaces';
import { FolderService } from 'src/services/folder.service';
import { IAuthTokenResponse } from 'src/types/types';

@ApiTags('Folder')
@Controller('folder')
@ApiBearerAuth()
export class FolderController {
  constructor(private readonly fileFolderService: FolderService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @SignedInUser() user: IAuthTokenResponse,
  ): Promise<FolderInterface> {
    console.log(createFolderDto);
    try {
      console.log(user);
      return await this.fileFolderService.createFolder(
        createFolderDto,
        user.userId,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getFolderDataByFolderId(
    @Param('id') folderId: string,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<{ folders: FolderInterface[]; files: AttachmentInterface[] }> {
    return await this.fileFolderService.getFolderDataByFolderId(
      folderId,
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('move')
  async moveFolder(
    @Body() payload: MoveFolderDto,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<FolderInterface> {
    try {
      return await this.fileFolderService.moveFolder(userId, payload);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(
    @Param('id') folderId: string,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<void> {
    try {
      return await this.fileFolderService.deleteFolder(userId, folderId);
    } catch (error) {
      throw error;
    }
  }
}
