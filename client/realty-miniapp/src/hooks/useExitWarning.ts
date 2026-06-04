import { useEffect } from 'react';

export const useExitWarning = (
  message: string = 'Вы уверены, что хотите покинуть приложение?',
) => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

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
