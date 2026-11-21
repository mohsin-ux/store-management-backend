import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
     origin: 'http://localhost:5173',
     methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
     credentials: true, // Set to true if you are sending cookies or auth headers
   });

  // Reject invalid request bodies with a 400 instead of letting them reach Prisma
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Turn Prisma errors (missing unique field, FK violation, ...) into proper 4xx responses
  app.useGlobalFilters(new PrismaExceptionFilter());

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

  await app.listen(Number(process.env.PORT));
}
bootstrap();
