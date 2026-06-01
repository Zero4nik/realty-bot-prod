import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { PrismaService } from 'src/prisma/prisma.service';
import { inlineKeyboard } from 'telegraf/markup';

@Injectable()
export class BotService {
  constructor(private readonly prisma: PrismaService) {}
  private escapeMarkdownV2(text: string): string {
    return text.replace(/([_\*\[\]\(\)~`>#\+\-\=|{}.!])/g, '\\$1');
  }
  async handleStart(ctx: Context) {
    const welcomeText = this.escapeMarkdownV2(
      `🏠 *Добро пожаловать в сервис аренды!*\n\n` +
        `Расскажите, какая квартира Вам нужна 🏡\n\n` +
        `Выберите параметры, и мы покажем только подходящие варианты.`,
    );
    await ctx.reply(welcomeText, {
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([
        [
          Markup.button.webApp(
            'Выбрать квартиру',
            'https://www.bestchange.ru/tether-trc20-to-tinkoff.html',
          ),
        ],
        [
          Markup.button.callback('ℹ️ О нас', 'about'),
          Markup.button.callback('👤 Связаться', 'contact'),
        ],
      ]),
    });
  }
  async handleAbout(ctx: Context) {
    await ctx.answerCbQuery();
    const aboutText = this.escapeMarkdownV2(
      `🏠 *АрендаPL — недвижимость в Польше*\n\n` +
        `Работаем с 2024 года. Агентство полного цикла: аренда жилья, покупка квартир, коммерческая недвижимость, инвестиционные объекты.\n\n` +
        `*Наши цифры:*\n` +
        `📊 Аренда — средний чек 1.000–3.000 zł\n` +
        `📊 Продажа — средний чек 15.000–500.000 zł\n` +
        `📊 2 года на рынке, десятки закрытых сделок\n\n` +
        `*Что мы делаем:*\n` +
        `✅ Подбор объектов под ваш бюджет и критерии\n` +
        `✅ Полное сопровождение сделки\n` +
        `✅ Консультации 24/7\n` +
        `✅ Прямой контакт с агентом в Telegram\n\n` +
        `*Почему мы:*\n` +
        `— Работаем без посредников\n` +
        `— Знаем рынок Польши изнутри\n` +
        `— Строим долгосрочные отношения с клиентами\n\n` +
        `*Связь с агентом:*\n` +
        `👤 @Dim404\n` +
        `💬 Пишите в любое время — ответим в течение часа`,
    );
    await ctx.reply(aboutText, { parse_mode: 'MarkdownV2' });
  }
  async handleContact(ctx: Context) {
    await ctx.answerCbQuery();
    const contactText = this.escapeMarkdownV2(
      `👤 *Связь с агентом:*\n\n` +
        `Наш агент @Dim404 всегда на связи!\n` +
        `💬 Пишите в любое время — ответим в течение часа.`,
    );
    await ctx.reply(contactText, { parse_mode: 'MarkdownV2' });
  }
  async handleFallback(ctx: Context) {
    await ctx.reply('Используйте кнопки под сообщением для навигации.', {
      parse_mode: 'MarkdownV2',
    });
  }
}
