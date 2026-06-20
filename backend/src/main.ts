import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { setupSwagger } from './config/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  config.assertProductionSecrets();

  if (config.nodeEnv === 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );
  }

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // --- UPDATED CORS CONFIGURATION ---
  app.enableCors({
    origin: (origin, callback) => {
      // 1. Allow server-to-server requests or tools like Postman
      if (!origin) return callback(null, true);

      // 2. Ensure config origins are an array
      const configuredOrigins = Array.isArray(config.frontendOrigins)
        ? config.frontendOrigins
        : [config.frontendOrigins];

      // 3. Define all allowed exact URLs
      const allowedOrigins = [
        ...configuredOrigins,
        'http://localhost:3000',
      ];

      // 4. Check for Vercel Preview URLs via Regex
      const isVercelPreview = /^https:\/\/real-estate-blockchain-marketplace-.*\.vercel\.app$/.test(origin);

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  // ----------------------------------

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  setupSwagger(app, config);

  await app.listen(config.port);

  const publicBase = config.apiPublicUrl ?? config.localApiBaseUrl;
  Logger.log(`ChainEstate API listening on port ${config.port}`, 'Bootstrap');
  Logger.log(`REST base: ${publicBase}/api`, 'Bootstrap');
  Logger.log(`Health: ${publicBase}/api/health`, 'Bootstrap');
}

bootstrap();
