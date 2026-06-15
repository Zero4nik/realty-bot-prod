import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN'),
      }),
    }),
  ],
  providers: [BotService, BotUpdate],
  exports: [BotService],
})
export class BotModule {}
