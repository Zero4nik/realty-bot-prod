import { useEffect } from 'react';

export const useExitWarning = (
  message: string = 'Вы уверены, что хотите покинуть приложение?',
) => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) return;

    // 1. Кнопка "Назад" в шапке
    tg.BackButton.show();

    const handleBackClick = () => {
      tg.showConfirm(message, (confirmed: boolean) => {
        if (confirmed) {
          tg.close();
        }
      });
    };

    tg.BackButton.onClick(handleBackClick);

    // 2. Ловим сворачивание/закрытие Mini App
    const handleViewportChange = () => {
      if (!tg.isExpanded) {
        // Пользователь свайпнул вниз — возвращаем обратно
        tg.expand();
        tg.showConfirm(message, (confirmed: boolean) => {
          if (confirmed) {
            tg.close();
          }
        });
      }
    };

    tg.onEvent('viewportChanged', handleViewportChange);

    return () => {
      tg.BackButton.offClick(handleBackClick);
      tg.BackButton.hide();
      tg.offEvent('viewportChanged', handleViewportChange);
    };
  }, [message]);
};
