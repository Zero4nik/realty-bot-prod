const RETRY_ATTEMPTS = 10;
const RETRY_DELAY_MS = 300;

function readIdOnce(): string | undefined {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return undefined;

  const unsafeId = webApp.initDataUnsafe?.user?.id;
  if (unsafeId) return unsafeId.toString();

  // Fallback: parse the raw signed initData string when initDataUnsafe is empty.
  if (webApp.initData) {
    try {
      const params = new URLSearchParams(webApp.initData);
      const rawUser = params.get('user');
      if (rawUser) {
        const id = (JSON.parse(rawUser) as { id?: number }).id;
        if (id) return id.toString();
      }
    } catch {
      // ignore malformed initData
    }
  }

  return undefined;
}

/**
 * Resolves the current Telegram user id, retrying while the WebApp object
 * initializes. Returns undefined if the app was not opened from Telegram.
 */
export async function getTelegramId(): Promise<string | undefined> {
  try {
    window.Telegram?.WebApp?.ready();
  } catch {
    // ready() can throw on some clients; ignore and keep polling.
  }

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    const id = readIdOnce();
    if (id) return id;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  return undefined;
}
