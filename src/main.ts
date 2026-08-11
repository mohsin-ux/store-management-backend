import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Store Management API')
    .setDescription('API documentation for the Store Management SaaS')
    .setVersion('1.0')
    .addTag('auth')
    .addBearerAuth() // Adds JWT authentication support for later use
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); 

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
