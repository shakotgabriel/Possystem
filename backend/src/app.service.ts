import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface SystemInfo {
  status: string;
  timestamp: string;
  uptime: number;
  database: {
    status: string;
    version?: string;
  };
  memory: NodeJS.MemoryUsage;
}

export interface HealthCheckResult {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: {
    message: string;
    details?: string;
  };
  details: Record<string, any>;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private dataSource: DataSource) {}

  getHello(): { message: string } {
    return { message: 'Welcome to POS API Service' };
  }

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const dbVersion = await this.dataSource.query(
        'SELECT sqlite_version() as version',
      );
      
      return {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'connected',
          version: dbVersion?.[0]?.version,
        },
        memory: process.memoryUsage(),
      };
    } catch (error) {
      this.logger.error('Error getting system info', error.stack);
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: 'disconnected',
        },
        memory: process.memoryUsage(),
      };
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    try {
                                  
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'ok',
        details: {
          database: {
            status: 'up',
          },
        },
      };
    } catch (error) {
      this.logger.error('Health check failed', error.stack);
      return {
        status: 'error',
        error: {
          message: 'Service unavailable',
          details: error.message,
        },
        details: {
          database: {
            status: 'down',
          },
        },
      };
    }
  }

  async getVersion(): Promise<{ version: string; environment: string }> {
    return {
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
