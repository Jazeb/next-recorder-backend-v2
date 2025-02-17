import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from '../../services/reports.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collections } from 'src/constants';
import { AttachmentSchema } from 'src/schemas/attachment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collections.files, schema: AttachmentSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
