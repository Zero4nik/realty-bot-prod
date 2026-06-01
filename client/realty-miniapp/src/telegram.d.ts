interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
