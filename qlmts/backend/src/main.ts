import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('QLMTS API')
    .setDescription('Quality Lab & Material Traceability System API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Materials & Traceability', 'Heat and batch management')
    .addTag('Testing', 'Sample registration and test results')
    .addTag('Reports', 'Report generation and approval')
    .addTag('Integration', 'SAP and instrument integrations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 QLMTS API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();