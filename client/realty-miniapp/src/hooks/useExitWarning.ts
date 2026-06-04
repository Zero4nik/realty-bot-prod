import { useEffect } from 'react';

// Типы прямо здесь
interface TelegramWebApp {
  close: () => void;
  showConfirm: (message: string, callback: (ok: boolean) => void) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
  };
}

export const useExitWarning = (
  message: string = 'Вы уверены, что хотите покинуть приложение?',
) => {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp as TelegramWebApp | undefined;

    if (!tg) return;

    tg.BackButton.show();

    const handleBackClick = () => {
      tg.showConfirm(message, (confirmed: boolean) => {
        if (confirmed) {
          tg.close();
        }
      });
    };

    tg.BackButton.onClick(handleBackClick);

    return () => {
      tg.BackButton.offClick(handleBackClick);
      tg.BackButton.hide();
    };
  }, [message]);
};
