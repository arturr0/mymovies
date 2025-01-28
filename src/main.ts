import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use PORT from the environment or default to 3000
  const port = process.env.PORT || 3000;
  app.enableCors(); // Allow cross-origin requests from the frontend
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
