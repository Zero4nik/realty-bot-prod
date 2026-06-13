import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // MVP: reflect any origin so the Telegram Mini App works regardless of which
  // Vercel domain it is served from.
  app.enableCors({
    origin: true,
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
