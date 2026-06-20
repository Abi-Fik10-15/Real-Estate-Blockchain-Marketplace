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

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow server-to-server requests or tools like Postman
      if (!origin) return callback(null, true);

      // Allow requests from the Railway service domain itself
      if (origin.includes('giving-simplicity-production-b1bb.up.railway.app')) {
        return callback(null, true);
      }

      // Ensure config origins are an array
      const configuredOrigins = Array.isArray(config.frontendOrigins)
        ? config.frontendOrigins
        : [config.frontendOrigins];

      // Define all allowed exact URLs
      const allowedOrigins = [
        ...configuredOrigins,
        'http://localhost:3000',
        'http://localhost:5173',
      ];

      // Check for Vercel Preview URLs via Regex
      const isVercelPreview = /^https:\/\/real-estate-blockchain-marketplace-.*\.vercel\.app$/.test(origin);

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

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
