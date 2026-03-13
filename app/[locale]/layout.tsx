import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import NavBar from '@/components/ui/NavBar';
import { UserProvider } from '@/lib/UserContext';

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <UserProvider>
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </UserProvider>
    </NextIntlClientProvider>
  );
}
