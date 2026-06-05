import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  const port = process.env.PORT || 10000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}

bootstrap();
