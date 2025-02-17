import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileTypes } from 'src/constants';
import { SignedInUser } from 'src/decorators/user.decorator';
import { MoveMediaItemDto, UpdateFileNamePayload } from 'src/dtos/dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { AttachmentInterface } from 'src/interfaces/interfaces';
import { FilesService } from 'src/services/files.service';
import { IAuthTokenResponse } from 'src/types/types';

@ApiTags('Files')
@Controller('files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getAllFiles(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ): Promise<AttachmentInterface[]> {
    try {
      return await this.filesService.getAllFiles(page, pageSize);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id/move')
  async moveFile(
    @Param('id') fileId: string,
    @Body() moveItemDto: MoveMediaItemDto,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<AttachmentInterface> {
    try {
      return await this.filesService.moveFile(userId, fileId, moveItemDto);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id/update-name')
  async updateFileName(
    @Param('id') fileId: string,
    @Body() payload: UpdateFileNamePayload,
  ): Promise<AttachmentInterface> {
    try {
      return await this.filesService.updateFileName(fileId, payload);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(
    @Param('id') fileId: string,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<void> {
    try {
      return await this.filesService.deleteFile(userId, fileId);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('folder/:folderId')
  async getFilesByFolderId(
    @Param('folderId') folderId: string,
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<AttachmentInterface[]> {
    try {
      return await this.filesService.getFilesByFolderId(userId, folderId);
    } catch (error) {
      throw error;
    }
  }

  // ADMIN - GET ALL IMAGES OR GET ALL VIDEOS
  // FOR VIDEOS & CAPTURES SCREEN
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('details/:fileType')
  async getAllFileDetails(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Param('fileType') fileType: FileTypes,
  ): Promise<{ total: number; data: AttachmentInterface[] }> {
    try {
      return await this.filesService.getAllFileDetails(
        Number(page),
        Number(pageSize),
        fileType,
      );
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('last-four')
  async getLastFourMediaItems(
    @SignedInUser() { userId }: IAuthTokenResponse,
  ): Promise<AttachmentInterface[]> {
    try {
      return await this.filesService.getLastFourMediaItems(userId);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('file-details/:id')
  async getItemDetailWithComments(@Param('id') fileId: string) {
    try {
      return await this.filesService.getItemDetailsWithComments(fileId);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('search/:searchTerm')
  async searchFilesByName(@Param('searchTerm') searchTerm: string) {
    try {
      return await this.filesService.searchFilesByName(searchTerm);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getFileDetails(@Param('id') fileId: string) {
    try {
      return await this.filesService.getFileDetails(fileId);
    } catch (error) {
      throw error;
    }
  }
}
