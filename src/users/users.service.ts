import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  [x: string]: any;
  constructor(private prisma: PrismaService) {}

  async create(
    data: {
      telegramId: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      referralCode?: string;
    },
    initData?: string,
  ) {
    // 1. Проверяем, существует ли уже юзер
    const existing = await this.prisma.user.findUnique({
      where: { telegramId: data.telegramId },
    });

    if (existing) {
      return this.getProfile(data.telegramId);
    }

    // 2. Генерируем свой реферальный код
    const ownReferralCode = crypto.randomUUID();

    // 3. Ищем того кто пригласил
    let referrerId: number | null = null;

    if (data.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: data.referralCode },
      });

      if (referrer) {
        referrerId = referrer.id;
        // Не даём рефералить самого себя
        if (referrer.telegramId === data.telegramId) {
          referrerId = null;
        }
      }
    }

    // 4. Создаём нового юзера
    const newUser = await this.prisma.user.create({
      data: {
        telegramId: data.telegramId,
        username: data.username || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        referralCode: ownReferralCode,
        referrerId: referrerId, // ← СВЯЗЬ С ПРИГЛАСИВШИМ
      },
    });

    return this.getProfile(data.telegramId);
  }

  async getProfile(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        _count: {
          select: {
            inquiries: true,
            referrals: true,
          },
        },
        referrer: {
          select: {
            id: true,
            username: true,
            firstName: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName || 'Пользователь',
      lastName: user.lastName || '',
      referralCode: user.referralCode,
      referrer: user.referrer,
      referralCount: user._count.referrals,
      role: user.role,
      inquiriesCount: user._count.inquiries,
      referralEarnings: 0,
      dealsCount: 0,
    };
  }

  async getReferrals(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        referrals: {
          select: {
            id: true,
            username: true,
            firstName: true,
            createdAt: true,
          },
        },
      },
    });

    return user?.referrals || [];
  }
  async getTransactions(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: {
        inquiries: {
          where: {
            transaction: {
              isNot: null,
            },
          },
          include: {
            property: {
              select: {
                id: true,
                title: true,
                city: true,
                price: true,
              },
            },
            transaction: true,
          },
        },
      },
    });

    if (!user) {
      return [];
    }
    const transactions = user.inquiries.map((inquiry) => ({
      transactionsId: inquiry.transaction!.id,
      amount: inquiry.transaction!.amount,
      commision: inquiry.transaction!.commission,
      yourPercent: inquiry.transaction!.yourPercent,
      propertyTittle: inquiry.property.title,
      propertyCity: inquiry.property.city,
      propertyPrice: inquiry.property.price,
      inquiryStatus: inquiry.status,
      createdAt: inquiry.transaction.createdAt,
    }));
    return transactions;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        _count: {
          select: { inquiries: true, referrals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      referralCode: user.referralCode,
      referralCount: user._count.referrals,
      inquiriesCount: user._count.inquiries,
      createdAt: user.createdAt,
    }));
  }
}
