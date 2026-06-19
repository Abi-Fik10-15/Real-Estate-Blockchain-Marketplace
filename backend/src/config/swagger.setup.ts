import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './app-config.service';

export function setupSwagger(
  app: INestApplication,
  config: AppConfigService,
): void {
  if (!config.swaggerEnabled) {
    Logger.log('Swagger UI disabled (SWAGGER_ENABLED=false)', 'Bootstrap');
    return;
  }

  const builder = new DocumentBuilder()
    .setTitle('ChainEstate API')
    .setDescription(
      'REST API for the ChainEstate blockchain real estate marketplace. ' +
        'Authenticate via **POST /auth/login**, copy the `accessToken`, then click **Authorize** and paste `Bearer <token>`.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from POST /auth/login or /auth/register',
      },
      'JWT',
    )
    .addTag('health', 'Service health and metadata')
    .addTag('auth', 'Registration, login, profile, avatar')
    .addTag('users', 'User directory and saved properties')
    .addTag('properties', 'Listings, uploads, approval')
    .addTag('inquiries', 'Buyer inquiries and agent responses')
    .addTag('transactions', 'Sales, escrow, and confirmation')
    .addTag('blockchain', 'Sepolia contract reads and minting');

  const localServer = config.localApiBaseUrl;
  const publicUrl = config.apiPublicUrl;

  if (publicUrl) {
    const productionBase = publicUrl.replace(/\/$/, '');
    builder.addServer(productionBase, 'Production (API_PUBLIC_URL)');
  }

  builder.addServer(localServer, 'Local / current host');

  const document = SwaggerModule.createDocument(app, builder.build(), {
    operationIdFactory: (controllerKey, methodKey) =>
      `${controllerKey}_${methodKey}`,
  });

  const docsPath = config.swaggerPath;

  SwaggerModule.setup(docsPath, app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: `${docsPath}/openapi.json`,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'ChainEstate API — Swagger',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const base = publicUrl || config.localApiBaseUrl;
  Logger.log(
    `Swagger UI: ${base}/api/${docsPath}`,
    'Bootstrap',
  );
  Logger.log(
    `OpenAPI JSON: ${base}/api/${docsPath}/openapi.json`,
    'Bootstrap',
  );
}
