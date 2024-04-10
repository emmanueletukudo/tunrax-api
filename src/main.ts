import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const validationPipeService = require('@pipets/validation-pipes');

async function bootstrap() {
  try {
    validationPipeService();
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    const config = new DocumentBuilder()
      .setTitle('Tundrax')
      .setDescription('Tundrax API Documentation')
      .setVersion('1.0')
      .addTag('tundrax v1')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('tundrax-api', app, document);

    await app.listen(6000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (err) {}
}

bootstrap();
