import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalProperties,
      newInquiries,
      inProgressInquiries,
      closedInquiries,
      totalDeals,
      aggregation,
      recentInquiries,
      topReferrers,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.property.count({
        where: { isActive: true },
      }),

      this.prisma.inquiry.count({
        where: { status: 'new' },
      }),
      this.prisma.inquiry.count({
        where: { status: 'in_progress' },
      }),
      this.prisma.inquiry.count({
        where: { status: 'done' },
      }),
      this.prisma.transaction.count(),
      this.prisma.transaction.aggregate({
        _sum: {
          commission: true,
          yourPercent: true,
        },
      }),
      this.prisma.inquiry.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              username: true,
              telegramId: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              price: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: {
          referrals: {
            _count: 'desc',
          },
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          referralCode: true,
          _count: {
            select: {
              referrals: true,
            },
          },
        },
      }),
    ]);
    return {
      // Общие цифры
      totalUsers,
      totalProperties,
      totalDeals,

      // Заявки по статусам
      newInquiries,
      inProgressInquiries,
      closedInquiries,

      // Финансы
      totalCommission: aggregation._sum.commission || 0,
      totalYourPercent: aggregation._sum.yourPercent || 0,

      // Последние заявки (для таблицы в админке)
      recentInquiries: recentInquiries.map((inq) => ({
        id: inq.id,
        status: inq.status,
        user: inq.user,
        property: inq.property,
        createdAt: inq.createdAt,
      })),

      // Топ рефереров
      topReferrers: topReferrers.map((user) => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        referralCode: user.referralCode,
        referralCount: user._count.referrals,
      })),
    };
  }
}
