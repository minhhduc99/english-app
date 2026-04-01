import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Setting a global prefix to isolate APIs
  app.setGlobalPrefix('api');
  app.enableCors(); // Allowed for seamless communication with React FE

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Core Service is running on: http://localhost:${port}`);
}
bootstrap();
