import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log("Starting application...");

  const app = await NestFactory.create(AppModule);

  console.log("Checking PORT environment variable:", process.env.PORT);
  
  const port = process.env.PORT || 3000;
  
  console.log(`About to start server on port: ${port}`);
  
  await app.listen(port);
  
  console.log(`Application running on port ${port}`);
}

bootstrap();
