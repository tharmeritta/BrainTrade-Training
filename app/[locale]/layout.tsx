import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import AgentPresenceWrapper from '@/components/features/AgentPresenceWrapper';

export default async function LocaleLayout({ 
  children,
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AgentPresenceWrapper locale={locale}>
        {children}
      </AgentPresenceWrapper>
    </NextIntlClientProvider>
  );
}
