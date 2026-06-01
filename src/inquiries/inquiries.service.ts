import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectBot } from 'nestjs-telegraf';  
import { Telegraf, Context } from 'telegraf'; 

@Injectable()
export class InquiriesService {
  constructor(
    private prisma: PrismaService,
    @InjectBot() private bot: Telegraf<Context>,  
  ) {}

  async create(data: { userId: number; propertyId: number }) {
    // Находим или создаём пользователя
    let user = await this.prisma.user.findUnique({
      where: { telegramId: String(data.userId) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { telegramId: String(data.userId) },
      });
    }

    // Создаём заявку
    const inquiry = await this.prisma.inquiry.create({
      data: {
        userId: user.id,
        propertyId: data.propertyId,
        status: 'new',
      },
      include: {
        user: true,
        property: true,
      },
    });

    // Отправка уведомления агенту
    try {
      const property = inquiry.property;
      const inquiryUser = inquiry.user

      const message = [
        `🏠 <b>Новая заявка #${inquiry.id}</b>`,
        ``,
        `👤 <b>Клиент:</b> ${inquiryUser.firstName || 'Пользователь'} (@${inquiryUser.username || 'нет username'})`,
        `📍 <b>Объект:</b> ${property.title}`,
        `🏙 <b>Город:</b> ${property.city}${property.district ? `, ${property.district}` : ''}`,
        `💰 <b>Цена:</b> ${property.price} zł/мес`,
        `📐 <b>Площадь:</b> ${property.area} м², комнат: ${property.rooms}`,
        `🏢 <b>Этаж:</b> ${property.floor}/${property.totalFloors}`,
        ``,
        `📅 <b>Дата:</b> ${new Date().toLocaleString('ru-RU')}`,
      ].join('\n');

      const agentChatId = process.env.AGENT_CHAT_ID;

      if (agentChatId) {

        await this.bot.telegram.sendMessage(agentChatId, message, {
          parse_mode: 'HTML',
        });
        console.log(`✅ Уведомление агенту отправлено: заявка #${inquiry.id}`);
      } else {
        console.warn('⚠️ AGENT_CHAT_ID не задан в .env. Уведомление НЕ отправлено.');
      }
    } catch (error) {
      console.error('❌ Ошибка отправки уведомления агенту:', error);
    }

    return inquiry;
  }
}