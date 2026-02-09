import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

                                                 
  app.enableCors({
    origin:
      process.env.FRONTEND_URL ||
      [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
      ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });

                           
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

                                               
  try {
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.warn('Static assets or views directory not found:', errorMessage);
  }

                                                                                     
                                                                            
  const webDistCandidates = [
    process.env.WEB_DIST_DIR,
    resolve(process.cwd(), '..', 'point-of-sale', 'dist'),
    resolve(__dirname, '..', '..', 'point-of-sale', 'dist'),
  ].filter(Boolean) as string[];

  const webDistDir = webDistCandidates.find((dir) =>
    fs.existsSync(join(dir, 'index.html')),
  );

  if (webDistDir) {
    const webIndexHtml = join(webDistDir, 'index.html');
    app.useStaticAssets(webDistDir);

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET') return next();

      const pathName = req.path ?? '';
      const accept = String(req.headers.accept ?? '');
      if (
        pathName.startsWith('/api') ||
        pathName.startsWith('/swagger') ||
        pathName.startsWith('/docs') ||
        pathName.startsWith('/health') ||
        pathName.startsWith('/system') ||
        pathName.startsWith('/version')
      ) {
        return next();
      }

      // Only serve the SPA for real browser navigations.
      // This prevents API clients (axios/curl/fetch) from receiving HTML.
      if (!accept.includes('text/html')) {
        return next();
      }

                     
      return res.sendFile(webIndexHtml);
    });
  }

                                
  if (process.env.API_PREFIX) {
    app.setGlobalPrefix(process.env.API_PREFIX);
  }

  const port = process.env.PORT ?? 8000;
  const host = process.env.HOST ?? '127.0.0.1';
  await app.listen(port, host);
  Logger.log(`Application is running on: http://${host}:${port}`);
}
void bootstrap();
