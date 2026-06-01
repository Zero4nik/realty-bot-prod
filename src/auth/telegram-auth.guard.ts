import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createHmac } from 'crypto'; 

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  private readonly logger = new Logger(TelegramAuthGuard.name);
  private readonly botToken: string;

  constructor() {
    this.botToken = process.env.BOT_TOKEN;
    if (!this.botToken) {
      this.logger.error('BOT_TOKEN is not set in environment variables!');
      throw new Error('BOT_TOKEN is required for Telegram auth');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const initData = request.headers['x-telegram-initdata']; 

    if (!initData) {
      this.logger.error('No X-Telegram-InitData header');
      throw new UnauthorizedException('Missing Telegram credentials');
    }

    const isValid = this.validateInitData(initData);

    if (!isValid) {
      this.logger.error('Invalid Telegram hash');
      throw new UnauthorizedException('Invalid Telegram credentials');
    }

    request.user = this.parseUser(initData); 

    this.logger.log(
      `Auth OK: ${request.user.first_name} (${request.user.id})`,
    );
    return true;
  }

  private validateInitData(initData: string): boolean {
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');

      if (!hash) return false;
      urlParams.delete('hash');

      const sortedParams = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = createHmac('sha256', 'WebAppData') 
        .update(this.botToken)                             
        .digest();
      
      const calculatedHash = createHmac('sha256', secretKey)
        .update(sortedParams)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      this.logger.error('Error validating Telegram hash:', error);
      return false;
    }
  }

  private parseUser(initData: string): any { 
    try {
      const urlParams = new URLSearchParams(initData);
      const userString = urlParams.get('user');
      
      if (!userString) return null;
      
      return JSON.parse(userString);
    } catch {
      return null;
    }
  }
}