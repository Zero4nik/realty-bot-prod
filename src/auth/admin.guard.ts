import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class adminGuard implements CanActivate {
  private readonly logger = new Logger(adminGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Берём ID из трёх источников (по приоритету):
    // 1. request.user (если был TelegramAuthGuard)
    // 2. x-user-id заголовок (для curl)
    // 3. x-telegram-initdata (если есть, парсим на лету)
    let userId = request.user?.id?.toString();

    if (!userId) {
      userId = request.headers['x-user-id'];
    }

    if (!userId && request.headers['x-telegram-initdata']) {
      const initData = request.headers['x-telegram-initdata'];
      const urlParams = new URLSearchParams(initData);
      const userString = urlParams.get('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          userId = user.id?.toString();
        } catch {}
      }
    }

    const adminIdsEnv = process.env.ADMIN_IDS || '';
    const adminIds = adminIdsEnv
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (!userId || !adminIds.includes(userId)) {
      this.logger.warn(`ДОСТУП ЗАПРЕЩЁН: userId=${userId} не админ`);
      throw new ForbiddenException(
        'Доступ запрещён. Только для администраторов.',
      );
    }

    this.logger.log(`Админ доступ разрешён: userId=${userId}`);
    return true;
  }
}
