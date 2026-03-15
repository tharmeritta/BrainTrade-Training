import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/**
 * Locale layout — provides i18n context only.
 * NavBar is intentionally NOT here — full-screen pages (dashboard, admin, evaluator)
 * manage their own chrome. Routes that need NavBar have their own sub-layout.
 */
export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
