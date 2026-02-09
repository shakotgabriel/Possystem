import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  @ApiResponse({ status: 200, description: 'Returns a welcome message' })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({ status: 200, description: 'Returns system health status' })
  checkHealth() {
    return this.appService.checkHealth();
  }

  @Get('system/info')
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({ status: 200, description: 'Returns system information' })
  getSystemInfo() {
    return this.appService.getSystemInfo();
  }

  @Get('version')
  @ApiOperation({ summary: 'Get application version' })
  @ApiResponse({ status: 200, description: 'Returns application version' })
  getVersion() {
    return this.appService.getVersion();
  }
}
