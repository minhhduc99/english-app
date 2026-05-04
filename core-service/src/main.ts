import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Setting a global prefix to isolate APIs
  app.setGlobalPrefix('api');
  app.enableCors(); // Allowed for seamless communication with React FE

  // Global pipes & interceptors
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('EduLMS API')
    .setDescription('The core API description for EduLMS and AI integration')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('courses')
    .addTag('users')
    .addTag('attendance')
    .addTag('materials')
    .addTag('vocabularies')
    .addTag('games')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Increase payload size for base64 images in exams
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Core Service is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();

