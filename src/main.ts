import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { Enviornments } from './constants';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ErrorFilter } from './filters/exception.filter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new ErrorFilter(reflector));
  const port = process.env.PORT;
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Next Recorder')
    .setVersion('1.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  if (
    process.env.ENV === Enviornments.LOCAL ||
    process.env.ENV === Enviornments.DEV
  ) {
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(port, () => {
    console.log(`Application is running on port : ${port}`);
  });
}
bootstrap();
