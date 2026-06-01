import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token:
        process.env.BOT_TOKEN ||
        '7963796300:AAEIZsMOVbdZqEdwQlh8-IA17tiqW1i7ZG8',
    }),
  ],
  providers: [BotService, BotUpdate],
  exports: [BotService, TelegrafModule],
})
export class botModule {}
