import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log("Starting application...");

    // Create the NestJS application
    const app = await NestFactory.create(AppModule);

    // Check the PORT environment variable
    console.log("Checking PORT environment variable:", process.env.PORT);

    // Ensure that the port is defined
    const port = process.env.PORT || 3000;  // fallback to 3000 if PORT is undefined
    console.log(`About to start server on port: ${port}`);

    // Start the server
    await app.listen(port);
    console.log(`Application running on port ${port}`);
  } catch (error) {
    console.error("Error during application startup:", error);
  }
}

bootstrap();
