import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Log the Render-assigned PORT environment variable
  console.log(`Render PORT: ${process.env.PORT}`);
  
  // Use Render-assigned port or fallback to 3000 if not defined
  const port = process.env.PORT || 3000;
  
  await app.listen(port);
  
  // Log confirmation after the app starts
  console.log(`Application running on port ${port}`);
}

// Call the bootstrap function to start the app
bootstrap();
