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
    //  ПОЛУЧАЕМ ОБЪЕКТ ЗАПРОСА
    const request = context.switchToHttp().getRequest();
    //В Telegram Mini App ID передаётся в initData,мы будем использовать ЗАГОЛОВОК x-user-id
    const userId = request.headers['x-user-id'];

    //  ПОЛУЧАЕМ СПИСОК АДМИНОВ ИЗ .env
    const adminIdsEnv = process.env.ADMIN_IDS || '';
    const adminIds = adminIdsEnv
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0); // убираем пустые строки
    // ПРОВЕРЯЕМ: есть ли userId в списке админов?
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
