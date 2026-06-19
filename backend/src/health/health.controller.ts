import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'API root — links and version' })
  root() {
    return {
      service: 'chainestate-api',
      status: 'ok',
      version: '1.0.0',
      docs: {
        swagger: 'GET /api/docs',
        openApiJson: 'GET /api/docs/openapi.json',
        health: 'GET /api/health',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for load balancers and Docker' })
  health() {
    return { status: 'ok', service: 'chainestate-api', version: '1.0.0' };
  }
}
