import type { Metadata } from 'next';
import './globals.css';
import NavigationProgress from '@/components/ui/NavigationProgress';

export const metadata: Metadata = {
  title: 'BrainTrade Training',
  description: 'Sales Agent Training Platform',
};

// Inline script runs synchronously before paint — prevents theme flash.
// Defaults to 'dark' if no preference is stored.
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Theme: must run before paint to prevent flash */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Fonts: preconnect first, then load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap"
        />
      </head>
      <body className="bg-background min-h-screen antialiased" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
