import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collections } from 'src/constants';
import { CreateFolderDto, MoveFolderDto } from 'src/dtos/dto';
import {
  AttachmentInterface,
  FolderInterface,
} from 'src/interfaces/interfaces';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Collections.folders)
    private folderModel: Model<FolderInterface>,
    @InjectModel(Collections.files)
    private filesModel: Model<AttachmentInterface>,
  ) {}

  async createFolder(
    payload: CreateFolderDto,
    userId: string,
  ): Promise<FolderInterface> {
    try {
      const { name, parentId = undefined } = payload;
      if (parentId) {
        const folder = await this.folderModel.findOne({
          name,
          userId,
          parentId,
          isActive: true,
        });
        if (folder) {
          throw new HttpException(
            'Folder with the same name already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        const foldersAtRootDirectory = await this.folderModel.find({
          isActive: true,
          parentId: null,
          userId,
          name,
        });
        if (foldersAtRootDirectory.length > 0) {
          throw new HttpException(
            'Folder with the same name already exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return await this.folderModel.create({
        ...payload,
        userId,
      });
    } catch (error) {
      throw error;
    }
  }

  async getFolderDataByFolderId(
    folderId: string,
    userId: string,
  ): Promise<{ folders: FolderInterface[]; files: AttachmentInterface[] }> {
    try {
      const [folders, files] = await Promise.all([
        this.folderModel
          .find({ userId, isActive: true, parentId: folderId })
          .exec(),
        this.filesModel.find({ userId, folderId, isActive: true }).exec(),
      ]);
      return { folders, files };
    } catch (error) {
      console.error('Error fetching folders and files:', error);
      throw error;
    }
  }

  async moveFolder(
    userId: string,
    payload: MoveFolderDto,
  ): Promise<FolderInterface> {
    const { folderId, newparentFolderId } = payload;
    try {
      return await this.folderModel.findOneAndUpdate(
        { _id: folderId, userId },
        { parentId: newparentFolderId },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteFolder(userId: string, folderId: string): Promise<void> {
    try {
      return await this.folderModel.findOneAndUpdate(
        { _id: folderId, userId },
        { isActive: false },
        { new: true },
      );
    } catch (error) {
      throw error;
    }
  }
}
