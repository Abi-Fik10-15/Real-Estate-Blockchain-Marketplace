import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      service: 'chainestate-api',
      status: 'ok',
      version: '0.1.0',
      docs: {
        health: 'GET /api/health',
        auth: 'POST /api/auth/register | /api/auth/login',
        properties: 'GET /api/properties',
        users: 'GET /api/users/agents',
      },
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'chainestate-api' };
  }
}
