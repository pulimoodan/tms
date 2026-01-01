import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  app.useStaticAssets(join(process.cwd(), uploadPath), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TMS API')
    .setDescription('Transportation Management System REST API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Roles', 'Role and permission management endpoints')
    .addTag('Credit Terms', 'Credit terms management endpoints')
    .addTag('Locations', 'Location management endpoints')
    .addTag('Vehicle Types', 'Vehicle type management endpoints')
    .addTag('Drivers', 'Driver management endpoints')
    .addTag('Vehicles', 'Vehicle management endpoints')
    .addTag('Customers', 'Customer management endpoints')
    .addTag('Contracts', 'Contract management endpoints')
    .addTag('Contract Routes', 'Contract route management endpoints')
    .addTag('Orders', 'Order/Waybill management endpoints')
    .addTag('Companies', 'Company management endpoints')
    .addTag('Upload', 'File upload endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    const frontendPath = join(process.cwd(), 'client', 'dist', 'public');

    app.useStaticAssets(frontendPath, {
      prefix: '/',
      index: false,
    });

    app.getHttpAdapter().get('*', (req: any, res: any, next: any) => {
      if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.includes('.')) {
        return next();
      }
      res.sendFile(join(frontendPath, 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger documentation available at: http://localhost:${port}/api`);
    console.log(`OpenAPI JSON available at: http://localhost:${port}/api-json`);
    console.log(`OpenAPI YAML available at: http://localhost:${port}/api-yaml`);
  }
}

bootstrap();
