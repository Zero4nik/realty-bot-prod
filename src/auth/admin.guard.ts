import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class adminGuard implements CanActivate {
  private readonly logger = new Logger(adminGuard.name);

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new ForbiddenException(
        'Доступ запрещён. Только для администраторов.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { telegramId: String(userId) },
    });

    if (!user || user.role !== 'admin') {
      this.logger.warn(`ДОСТУП ЗАПРЕЩЁН: userId=${userId} не админ`);
      throw new ForbiddenException(
        'Доступ запрещён. Только для администраторов.',
      );
    }

    this.logger.log(`Админ доступ разрешён: userId=${userId}`);
    return true;
  }
}
