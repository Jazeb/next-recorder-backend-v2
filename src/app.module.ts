import { Module } from '@nestjs/common';
import { AuthModule } from './components/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './components/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from './components/media/media.module';
import { HttpInterceptor } from './interceptors/response.interceptor';
import { FolderModule } from './components/folder/folder.module';
import { FilesModule } from './components/files/files.module';
import { PlansModule } from './components/plans/plans.module';
import { CommentsModule } from './components/comments/comments.module';
import { ReportsModule } from './components/reports/reports.module';
import { PaymentsModule } from './components/payments/payments.module';
import { DashboardModule } from './components/dashboard/dashboard.module';
import { S3Module } from './components/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
    MediaModule,
    FolderModule,
    FilesModule,
    PlansModule,
    CommentsModule,
    ReportsModule,
    PaymentsModule,
    DashboardModule,
    S3Module,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpInterceptor,
    },
  ],
})
export class AppModule {}
