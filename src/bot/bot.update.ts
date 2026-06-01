import { Command, Update, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Command('start')
  async onStart(ctx: Context) {
    await this.botService.handleStart(ctx);
  }
  @Action('about')
  async onAbout(ctx: Context) {
    await this.botService.handleAbout(ctx);
  }
  @Action('contact')
  async onContact(ctx: Context) {
    await this.botService.handleContact(ctx);
  }
}
