import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SessionProvider } from '@/components/features/SessionProvider';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { DM_Sans, DM_Mono } from 'next/font/google';
import type { Metadata } from 'next';

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

// Inline script runs synchronously before paint — prevents theme flash.
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('brainstrade_theme');
      var theme = stored === 'light' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', theme === 'dark');
    } catch(e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
