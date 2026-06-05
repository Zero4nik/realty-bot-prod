import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';
async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors({
    origin: [
      'https://realty-bot-prod.vercel.app',
      'https://realty-bot-prod-git-main-zero4niks-projects.vercel.app',
      'https://realty-bot-prod-bjmn.vercel.app',
      'https://realty-bot-prod-2xct32w1k-zero4niks-projects.vercel.app',
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
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}

bootstrap();
