import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: [
        'https://realty-bot-prod.vercel.app',
        'https://web.telegram.org',
        'https://t.me',
        'http://localhost:5173',
        'http://localhost:3000',
      ],
      methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
      allowedHeaders:
        'Content-Type, x-user-id, x-telegram-initdata, Authorization',
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const nestApp = await bootstrap();
  const instance = nestApp.getHttpAdapter().getInstance();

  if (instance && typeof instance === 'function') {
    return instance(req, res);
  }

  res.status(500).json({ error: 'Server not initialized' });
}
