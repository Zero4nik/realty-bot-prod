export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        close(): void;
        expand(): void;
        showConfirm(
          message: string,
          callback: (confirmed: boolean) => void,
        ): void;
        isExpanded: boolean;
        openTelegramLink(url: string): void;
        openLink(url: string): void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        BackButton: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        MainButton: {
          show(): void;
          hide(): void;
          setText(text: string): void;
          onClick(callback: () => void): void;
        };
        onEvent(event: string, callback: () => void): void;
        offEvent(event: string, callback: () => void): void; 
      };
    };
  }
}
