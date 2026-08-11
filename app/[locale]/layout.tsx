import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/constants';
import { SessionProvider } from '@/components/providers/SessionProvider';
import NavigationProgress from '@/components/ui/NavigationProgress';
import CommandPalette from '@/components/ui/CommandPalette';
import StaffAiCopilot from '@/components/ui/StaffAiCopilot';
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
  const resolvedParams = await props.params;
  const rawLocale = resolvedParams?.locale;
  const locale = (rawLocale && (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale) ? rawLocale : DEFAULT_LOCALE);
  
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
    <html lang={locale} className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <ThemeScript />
      </head>
      <body className="bg-background min-h-dvh pt-safe pb-safe antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SessionProvider locale={locale}>
            <NavigationProgress />
            <CommandPalette />
            <StaffAiCopilot />
            {children}
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
