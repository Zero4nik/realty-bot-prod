import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://realty-bot-prod-bjmn.vercel.app',
      'https://web.telegram.org',
      'https://t.me',
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, x-user-id, x-telegram-initdata',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
