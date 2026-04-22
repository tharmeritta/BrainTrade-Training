import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SessionProvider } from '@/components/features/SessionProvider';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { DM_Sans, DM_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import ThemeScript from '@/components/ui/ThemeScript';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-mono',
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'BrainTrade Training',
    description: 'Intelligent training platform',
    icons: {
      icon: '/favicon.svg',
    },
  };
}

export default async function LocaleLayout(props: { 
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const { locale } = await props.params;
  
  // Enable static rendering for this locale
  setRequestLocale(locale);

  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (err) {
    console.error(`Failed to load messages for locale ${locale}:`, err);
    messages = {};
  }

  return (
    <html lang={locale} className={`dark ${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-background min-h-screen antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SessionProvider locale={locale}>
            <NavigationProgress />
            {children}
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
